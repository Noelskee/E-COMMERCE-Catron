using Catron_Computer_Technology_PROEL4W_FINALS_.Data;
using Catron_Computer_Technology_PROEL4W_FINALS_.Helpers;
using Catron_Computer_Technology_PROEL4W_FINALS_.Models;
using Catron_Computer_Technology_PROEL4W_FINALS_.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Catron_Computer_Technology_PROEL4W_FINALS_.Controllers
{
    /// <summary>
    /// CustomerController owns every page a customer sees.
    ///
    /// Views live in:  Views/Customer/
    ///   Auth    : Login, Register, ForgotPassword, ResetPassword
    ///   Public  : Index (Home), About, Contact, Products, ProductDetail
    ///   Shopping: Cart, Checkout, Pay, ConfirmPayment, Receipt
    ///   Account : Dashboard, ManageAccount, MyOrders, OrderDetail,
    ///             MyWishList, MyReviews, MyReturns
    /// </summary>
    public class CustomerController : Controller
    {
        private readonly ApplicationDbContext _db;
        public CustomerController(ApplicationDbContext db) => _db = db;

        private int? CustId => HttpContext.Session.GetInt32("CustomerId");
        private bool IsLogged => CustId.HasValue;

        private IActionResult Guard(string? returnUrl = null) =>
            RedirectToAction("Login", new { returnUrl });

        // ══════════════════════════════════════════════════════════
        //  HOME / STATIC
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> Index()
        {
            var vm = new HomeViewModel
            {
                FeaturedProducts = await _db.Products.AsNoTracking().Include(p => p.Category)
                    .Where(p => p.IsActive).OrderByDescending(p => p.CreatedAt).Take(8).ToListAsync(),
                Categories = await _db.Categories.AsNoTracking().ToListAsync()
            };
            return View(vm);
        }

        public IActionResult About() => View();
        public IActionResult Contact() => View();

        [HttpPost]
        public IActionResult Contact(string name, string email, string message)
        {
            TempData["Success"] = "Thank you for contacting us! We'll get back to you shortly.";
            return RedirectToAction("Contact");
        }

        // ══════════════════════════════════════════════════════════
        //  LOGIN
        // ══════════════════════════════════════════════════════════

        [HttpGet]
        public IActionResult Login(string? returnUrl)
        {
            if (IsLogged) return RedirectToAction("Index");
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(CustomerLoginViewModel model, string? returnUrl)
        {
            if (!ModelState.IsValid) return View(model);

            var customer = await _db.Customers
                .FirstOrDefaultAsync(c => c.Email == model.Email && c.IsActive);

            if (customer == null || !CustomerPasswordHasher.Verify(model.Password, customer.PasswordHash))
            {
                ModelState.AddModelError("", "Invalid email or password.");
                return View(model);
            }

            HttpContext.Session.SetInt32("CustomerId", customer.Id);
            HttpContext.Session.SetString("CustomerName", customer.FullName);
            HttpContext.Session.SetString("CustomerEmail", customer.Email);

            return Redirect(!string.IsNullOrEmpty(returnUrl) ? returnUrl : "/Customer/Index");
        }

        // ══════════════════════════════════════════════════════════
        //  REGISTER
        // ══════════════════════════════════════════════════════════

        [HttpGet]
        public IActionResult Register() => View();

        [HttpPost]
        public async Task<IActionResult> Register(CustomerRegisterViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            if (await _db.Customers.AnyAsync(c => c.Email == model.Email))
            {
                ModelState.AddModelError("Email", "This email is already registered.");
                return View(model);
            }

            _db.Customers.Add(new Customer
            {
                FirstName = model.FirstName.Trim(),
                LastName = model.LastName.Trim(),
                Email = model.Email.Trim().ToLower(),
                PhoneNumber = model.PhoneNumber?.Trim(),
                PasswordHash = CustomerPasswordHasher.Hash(model.Password)
            });
            await _db.SaveChangesAsync();

            TempData["Success"] = "Account created! Please log in.";
            return RedirectToAction("Login");
        }

        // ══════════════════════════════════════════════════════════
        //  FORGOT / RESET PASSWORD
        // ══════════════════════════════════════════════════════════

        [HttpGet] public IActionResult ForgotPassword() => View();

        [HttpPost]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var c = await _db.Customers.FirstOrDefaultAsync(x => x.Email == model.Email);
            if (c != null)
            {
                c.ResetToken = CustomerPasswordHasher.GenerateResetToken();
                c.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);
                await _db.SaveChangesAsync();
                // TODO: email the link /Customer/ResetPassword?token=...&email=...
            }
            TempData["Info"] = "If your email is registered, a reset link has been sent.";
            return RedirectToAction("Login");
        }

        [HttpGet]
        public IActionResult ResetPassword(string token, string email) =>
            View(new ResetPasswordViewModel { Token = token, Email = email });

        [HttpPost]
        public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var c = await _db.Customers.FirstOrDefaultAsync(x =>
                x.Email == model.Email && x.ResetToken == model.Token && x.ResetTokenExpiry > DateTime.UtcNow);

            if (c == null) { ModelState.AddModelError("", "Invalid or expired link."); return View(model); }

            c.PasswordHash = CustomerPasswordHasher.Hash(model.NewPassword);
            c.ResetToken = null;
            c.ResetTokenExpiry = null;
            await _db.SaveChangesAsync();

            TempData["Success"] = "Password reset. Please log in.";
            return RedirectToAction("Login");
        }

        // ══════════════════════════════════════════════════════════
        //  LOGOUT
        // ══════════════════════════════════════════════════════════

        public IActionResult Logout() { HttpContext.Session.Clear(); return RedirectToAction("Index"); }

        // ══════════════════════════════════════════════════════════
        //  PRODUCTS
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> Products(int? categoryId, string? search, int page = 1)
        {
            const int ps = 12;
            var q = _db.Products.AsNoTracking().Include(p => p.Category).Where(p => p.IsActive);

            if (categoryId.HasValue) q = q.Where(p => p.CategoryId == categoryId);
            if (!string.IsNullOrWhiteSpace(search))
                q = q.Where(p => p.Name.Contains(search) ||
                    (p.Description != null && p.Description.Contains(search)) ||
                    (p.Brand != null && p.Brand.Contains(search)));

            int total = await q.CountAsync();
            var products = await q.OrderBy(p => p.Name).Skip((page - 1) * ps).Take(ps).ToListAsync();

            return View(new ProductListViewModel
            {
                Products = products,
                Categories = await _db.Categories.ToListAsync(),
                SelectedCategoryId = categoryId,
                SearchQuery = search,
                CurrentPage = page,
                TotalPages = (int)Math.Ceiling(total / (double)ps),
                TotalItems = total
            });
        }

        public async Task<IActionResult> ProductDetail(int id)
        {
            var product = await _db.Products.Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
            if (product == null) return NotFound();

            var reviews = await _db.Reviews.Include(r => r.Customer)
                .Where(r => r.ProductId == id).OrderByDescending(r => r.CreatedAt).ToListAsync();

            var related = await _db.Products.AsNoTracking().Include(p => p.Category)
                .Where(p => p.CategoryId == product.CategoryId && p.Id != id && p.IsActive)
                .Take(4).ToListAsync();

            bool inWl = IsLogged &&
                await _db.WishListItems.AnyAsync(w => w.CustomerId == CustId && w.ProductId == id);

            return View(new ProductDetailViewModel
            {
                Product = product,
                Reviews = reviews,
                RelatedProducts = related,
                IsInWishlist = inWl,
                AverageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0
            });
        }

        // ══════════════════════════════════════════════════════════
        //  CART
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> Cart()
        {
            if (!IsLogged) return Guard("/Customer/Cart");

            var items = await _db.CartItems.Include(c => c.Product).ThenInclude(p => p.Category)
                .Where(c => c.CustomerId == CustId).ToListAsync();

            return View(new CartViewModel
            {
                CartItems = items,
                TotalAmount = items.Sum(i => i.Product.FinalPrice * i.Quantity),
                TotalItems = items.Sum(i => i.Quantity)
            });
        }

        [HttpPost, IgnoreAntiforgeryToken]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest? body, int productId = 0, int quantity = 1)
        {
            if (body != null) { productId = body.ProductId; quantity = body.Quantity; }
            if (!IsLogged) return Json(new { success = false, redirect = "/Customer/Login", message = "Please log in first." });
            var product = await _db.Products.FindAsync(productId);
            if (product == null || !product.IsActive)
                return Json(new { success = false, message = "Product not available." });
            if (product.Stock == 0)
                return Json(new { success = false, message = "This product is out of stock." });
            quantity = Math.Clamp(quantity, 1, product.Stock);
            var ex = await _db.CartItems.FirstOrDefaultAsync(c => c.CustomerId == CustId && c.ProductId == productId);
            if (ex != null) ex.Quantity = Math.Min(ex.Quantity + quantity, product.Stock);
            else _db.CartItems.Add(new CartItem { CustomerId = CustId!.Value, ProductId = productId, Quantity = quantity, AddedAt = DateTime.UtcNow });
            await _db.SaveChangesAsync();
            int count = await _db.CartItems.Where(c => c.CustomerId == CustId).SumAsync(c => c.Quantity);
            return Json(new { success = true, message = product.Name + " added to cart!", count });
        }

        [HttpPost, IgnoreAntiforgeryToken]
        public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartRequest? body, int cartItemId = 0, int quantity = 0)
        {
            if (body != null) { cartItemId = body.CartItemId; quantity = body.Quantity; }
            if (!IsLogged) return Json(new { success = false });
            var item = await _db.CartItems.Include(c => c.Product)
                .FirstOrDefaultAsync(c => c.Id == cartItemId && c.CustomerId == CustId);
            if (item == null) return Json(new { success = false });
            if (quantity <= 0) _db.CartItems.Remove(item);
            else item.Quantity = Math.Min(quantity, item.Product.Stock);
            await _db.SaveChangesAsync();
            var all = await _db.CartItems.Include(c => c.Product).Where(c => c.CustomerId == CustId).ToListAsync();
            return Json(new
            {
                success = true,
                subtotal = item.Product.FinalPrice * (quantity > 0 ? quantity : 0),
                total = all.Sum(i => i.Product.FinalPrice * i.Quantity),
                count = all.Sum(i => i.Quantity)
            });
        }

        [HttpPost, IgnoreAntiforgeryToken]
        public async Task<IActionResult> RemoveCartItem([FromBody] RemoveCartRequest? body, int cartItemId = 0)
        {
            if (body != null) cartItemId = body.CartItemId;
            if (!IsLogged) return Json(new { success = false });
            var item = await _db.CartItems.Include(c => c.Product)
                .FirstOrDefaultAsync(c => c.Id == cartItemId && c.CustomerId == CustId);
            if (item != null) { _db.CartItems.Remove(item); await _db.SaveChangesAsync(); }
            var all = await _db.CartItems.Include(c => c.Product).Where(c => c.CustomerId == CustId).ToListAsync();
            return Json(new
            {
                success = true,
                total = all.Sum(i => i.Product.FinalPrice * i.Quantity),
                count = all.Sum(i => i.Quantity)
            });
        }

        public async Task<JsonResult> GetCartCount()
        {
            if (!IsLogged) return Json(new { count = 0 });
            int n = await _db.CartItems.AsNoTracking().Where(c => c.CustomerId == CustId).SumAsync(c => c.Quantity);
            return Json(new { count = n });
        }

        // ══════════════════════════════════════════════════════════
        //  CHECKOUT
        // ══════════════════════════════════════════════════════════

        [HttpGet]
        public async Task<IActionResult> Checkout()
        {
            if (!IsLogged) return Guard("/Customer/Checkout");

            var cartItems = await _db.CartItems.Include(c => c.Product)
                .Where(c => c.CustomerId == CustId).ToListAsync();
            if (!cartItems.Any()) return RedirectToAction("Cart");

            var addrs = await _db.CustomerAddresses.Where(a => a.CustomerId == CustId).ToListAsync();
            var def = addrs.FirstOrDefault(a => a.IsDefault);

            return View(new CheckoutViewModel
            {
                CartItems = cartItems,
                TotalAmount = cartItems.Sum(i => i.Product.FinalPrice * i.Quantity),
                SavedAddresses = addrs,
                ShippingFullName = def?.FullName ?? "",
                ShippingAddress = def?.Address ?? "",
                ShippingPhone = def?.PhoneNumber ?? ""
            });
        }

        // ══════════════════════════════════════════════════════════
        //  PLACE ORDER  ← BUG FIX HERE
        // ══════════════════════════════════════════════════════════

        [HttpPost]
        public async Task<IActionResult> PlaceOrder(CheckoutViewModel model, PaymentMethod paymentMethod)
        {
            if (!IsLogged) return Guard();

            var cartItems = await _db.CartItems.Include(c => c.Product)
                .Where(c => c.CustomerId == CustId).ToListAsync();
            if (!cartItems.Any()) return RedirectToAction("Cart");

            // ── FIX: if the customer selected a saved address via radio button,
            //         load it from the DB instead of relying on hidden/text fields.
            if (model.SelectedAddressId.HasValue && model.SelectedAddressId > 0)
            {
                var saved = await _db.CustomerAddresses
                    .FirstOrDefaultAsync(a => a.Id == model.SelectedAddressId && a.CustomerId == CustId);

                if (saved != null)
                {
                    model.ShippingFullName = saved.FullName;
                    model.ShippingAddress = saved.Address;
                    model.ShippingPhone = saved.PhoneNumber;
                }
            }

            // ── FIX: final safety net — if still empty, pull from customer profile.
            if (string.IsNullOrWhiteSpace(model.ShippingFullName) ||
                string.IsNullOrWhiteSpace(model.ShippingAddress) ||
                string.IsNullOrWhiteSpace(model.ShippingPhone))
            {
                var customer = await _db.Customers.FindAsync(CustId);

                // Try any saved address first
                var anyAddr = await _db.CustomerAddresses
                    .FirstOrDefaultAsync(a => a.CustomerId == CustId);

                model.ShippingFullName = anyAddr?.FullName
                    ?? customer?.FullName
                    ?? "N/A";

                model.ShippingAddress = anyAddr?.Address
                    ?? "No address provided";

                model.ShippingPhone = anyAddr?.PhoneNumber
                    ?? customer?.PhoneNumber
                    ?? "N/A";
            }

            var order = new Order
            {
                CustomerId = CustId!.Value,
                TotalAmount = cartItems.Sum(i => i.Product.FinalPrice * i.Quantity),
                PaymentMethod = paymentMethod,
                ShippingFullName = model.ShippingFullName,
                ShippingAddress = model.ShippingAddress,
                ShippingPhone = model.ShippingPhone
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            foreach (var item in cartItems)
            {
                _db.OrderItems.Add(new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.Product.FinalPrice
                });
                item.Product.Stock = Math.Max(0, item.Product.Stock - item.Quantity);
            }

            _db.CartItems.RemoveRange(cartItems);
            await _db.SaveChangesAsync();

            return RedirectToAction("Pay", new { orderId = order.Id });
        }

        // ══════════════════════════════════════════════════════════
        //  PAYMENT
        // ══════════════════════════════════════════════════════════

        [HttpGet]
        public async Task<IActionResult> Pay(int orderId)
        {
            if (!IsLogged) return Guard();

            var order = await _db.Orders
                .Include(o => o.OrderItems).ThenInclude(i => i.Product)
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == CustId);
            if (order == null) return NotFound();

            string? qr = null;
            if (order.PaymentMethod == PaymentMethod.GCash)
                qr = QRCodeHelper.GenerateBase64(
                    $"GCash Payment\nAmount: PHP {order.TotalAmount:N0}\nOrder #{order.OrderNumber}\nCatron Computer Technology");

            return View(new PaymentViewModel
            {
                Order = order,
                SelectedMethod = order.PaymentMethod,
                GCashNumber = order.Customer.PhoneNumber,
                QrCodeBase64 = qr
            });
        }

        [HttpPost]
        public async Task<IActionResult> ConfirmPayment(int orderId, string? gcashReference)
        {
            if (!IsLogged) return Guard();

            var order = await _db.Orders
                .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == CustId);
            if (order == null) return NotFound();

            order.PaymentStatus = PaymentStatus.Paid;
            order.Status = OrderStatus.ToShip;
            order.PaidAt = DateTime.UtcNow;
            order.GCashReference = gcashReference;

            _db.Receipts.Add(new Receipt { OrderId = order.Id, AmountPaid = order.TotalAmount });

            _db.DeliveryTrackings.Add(new DeliveryTracking
            {
                OrderId = order.Id,
                Status = "Order Confirmed & Payment Received",
                Location = "Catron Warehouse, Cebu City",
                Notes = "Your order has been paid and is being prepared for shipment.",
                TrackingTime = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
            return RedirectToAction("Receipt", new { orderId = order.Id });
        }

        [HttpGet]
        public async Task<IActionResult> Receipt(int orderId)
        {
            if (!IsLogged) return Guard();

            var order = await _db.Orders
                .Include(o => o.OrderItems).ThenInclude(i => i.Product)
                .Include(o => o.Customer)
                .Include(o => o.Receipt)
                .Include(o => o.DeliveryTrackings)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == CustId);
            if (order == null) return NotFound();
            return View(order);
        }

        // ══════════════════════════════════════════════════════════
        //  ACCOUNT DASHBOARD
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> Dashboard()
        {
            if (!IsLogged) return Guard();
            var customer = await _db.Customers.FindAsync(CustId);
            if (customer == null) return Guard();

            var recent = await _db.Orders
                .Include(o => o.OrderItems).ThenInclude(i => i.Product)
                .Where(o => o.CustomerId == CustId)
                .OrderByDescending(o => o.CreatedAt).Take(5).ToListAsync();

            return View(new AccountDashboardViewModel { Customer = customer, RecentOrders = recent });
        }

        // ══════════════════════════════════════════════════════════
        //  MANAGE MY ACCOUNT
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> ManageAccount()
        {
            if (!IsLogged) return Guard();
            var customer = await _db.Customers.FindAsync(CustId);
            if (customer == null) return Guard();

            var addrs = await _db.CustomerAddresses.Where(a => a.CustomerId == CustId).ToListAsync();
            var recent = await _db.Orders
                .Include(o => o.OrderItems).ThenInclude(i => i.Product)
                .Where(o => o.CustomerId == CustId)
                .OrderByDescending(o => o.CreatedAt).Take(5).ToListAsync();

            return View(new ManageAccountViewModel
            {
                Customer = customer,
                Addresses = addrs,
                DefaultBillingAddress = addrs.FirstOrDefault(a => a.IsBillingDefault),
                RecentOrders = recent
            });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateProfile(UpdateProfileViewModel model)
        {
            if (!IsLogged) return Guard();
            if (!ModelState.IsValid) { TempData["Error"] = "Please fix errors."; return RedirectToAction("ManageAccount"); }

            var c = await _db.Customers.FindAsync(CustId);
            if (c == null) return Guard();

            c.FirstName = model.FirstName.Trim();
            c.LastName = model.LastName.Trim();
            c.PhoneNumber = model.PhoneNumber?.Trim();
            await _db.SaveChangesAsync();

            HttpContext.Session.SetString("CustomerName", c.FullName);
            TempData["Success"] = "Profile updated.";
            return RedirectToAction("ManageAccount");
        }

        [HttpPost]
        public async Task<IActionResult> AddAddress(CustomerAddress address)
        {
            if (!IsLogged) return Guard();
            address.CustomerId = CustId!.Value;

            if (address.IsDefault)
                (await _db.CustomerAddresses.Where(a => a.CustomerId == CustId && a.IsDefault).ToListAsync())
                    .ForEach(a => a.IsDefault = false);

            if (address.IsBillingDefault)
                (await _db.CustomerAddresses.Where(a => a.CustomerId == CustId && a.IsBillingDefault).ToListAsync())
                    .ForEach(a => a.IsBillingDefault = false);

            _db.CustomerAddresses.Add(address);
            await _db.SaveChangesAsync();
            TempData["Success"] = "Address saved.";
            return RedirectToAction("ManageAccount");
        }

        [HttpPost]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            if (!IsLogged) return Guard();
            var a = await _db.CustomerAddresses.FirstOrDefaultAsync(x => x.Id == id && x.CustomerId == CustId);
            if (a != null) { _db.CustomerAddresses.Remove(a); await _db.SaveChangesAsync(); TempData["Success"] = "Address removed."; }
            return RedirectToAction("ManageAccount");
        }

        // ══════════════════════════════════════════════════════════
        //  MY ORDERS
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> MyOrders(string filter = "All")
        {
            if (!IsLogged) return Guard();

            var q = _db.Orders
                .Include(o => o.OrderItems).ThenInclude(i => i.Product)
                .Where(o => o.CustomerId == CustId);

            q = filter switch
            {
                "ToPay" => q.Where(o => o.Status == OrderStatus.ToPay),
                "ToShip" => q.Where(o => o.Status == OrderStatus.ToShip),
                "ToReceive" => q.Where(o => o.Status == OrderStatus.ToReceive),
                "ToReview" => q.Where(o => o.Status == OrderStatus.ToReview),
                "ReturnRefund" => q.Where(o => o.Status == OrderStatus.ReturnRefund),
                "Cancelled" => q.Where(o => o.Status == OrderStatus.Cancelled),
                _ => q
            };

            return View(new OrderListViewModel
            {
                Orders = await q.OrderByDescending(o => o.CreatedAt).ToListAsync(),
                Filter = filter
            });
        }

        public async Task<IActionResult> OrderDetail(int id)
        {
            if (!IsLogged) return Guard();
            var order = await _db.Orders
                .Include(o => o.OrderItems).ThenInclude(i => i.Product)
                .Include(o => o.DeliveryTrackings)
                .Include(o => o.Receipt)
                .FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == CustId);
            if (order == null) return NotFound();
            return View(order);
        }

        [HttpPost]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            if (!IsLogged) return Guard();
            var o = await _db.Orders.FirstOrDefaultAsync(x => x.Id == orderId && x.CustomerId == CustId);
            if (o != null && (o.Status == OrderStatus.ToPay || o.Status == OrderStatus.ToShip))
            {
                o.Status = OrderStatus.Cancelled;
                await _db.SaveChangesAsync();
                TempData["Success"] = "Order cancelled.";
            }
            else TempData["Error"] = "This order cannot be cancelled.";
            return RedirectToAction("MyOrders");
        }

        // ══════════════════════════════════════════════════════════
        //  WISHLIST
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> MyWishList()
        {
            if (!IsLogged) return Guard();
            var items = await _db.WishListItems.Include(w => w.Product).ThenInclude(p => p.Category)
                .Where(w => w.CustomerId == CustId).ToListAsync();
            return View(items);
        }

        [HttpPost, IgnoreAntiforgeryToken]
        public async Task<IActionResult> ToggleWishlist([FromBody] WishlistRequest? body, int productId = 0)
        {
            if (body != null) productId = body.ProductId;
            if (!IsLogged) return Json(new { success = false, redirect = "/Customer/Login" });
            var ex = await _db.WishListItems.FirstOrDefaultAsync(w => w.CustomerId == CustId && w.ProductId == productId);
            if (ex != null) { _db.WishListItems.Remove(ex); await _db.SaveChangesAsync(); return Json(new { success = true, added = false }); }
            _db.WishListItems.Add(new WishListItem { CustomerId = CustId!.Value, ProductId = productId, AddedAt = DateTime.UtcNow });
            await _db.SaveChangesAsync();
            return Json(new { success = true, added = true });
        }

        // ══════════════════════════════════════════════════════════
        //  REVIEWS
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> MyReviews()
        {
            if (!IsLogged) return Guard();
            var reviews = await _db.Reviews.Include(r => r.Product)
                .Where(r => r.CustomerId == CustId).OrderByDescending(r => r.CreatedAt).ToListAsync();
            return View(reviews);
        }

        [HttpPost]
        public async Task<IActionResult> AddReview(int productId, int orderId, int rating, string comment)
        {
            if (!IsLogged) return Guard();
            bool exists = await _db.Reviews.AnyAsync(r => r.CustomerId == CustId && r.ProductId == productId && r.OrderId == orderId);
            if (!exists)
            {
                _db.Reviews.Add(new Review { CustomerId = CustId!.Value, ProductId = productId, OrderId = orderId, Rating = Math.Clamp(rating, 1, 5), Comment = comment?.Trim() });
                await _db.SaveChangesAsync();
                TempData["Success"] = "Review submitted!";
            }
            else TempData["Error"] = "You've already reviewed this product for this order.";
            return RedirectToAction("MyReviews");
        }

        // ══════════════════════════════════════════════════════════
        //  RETURNS & CANCELLATIONS
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> MyReturns()
        {
            if (!IsLogged) return Guard();
            var returns = await _db.ReturnRequests.Include(r => r.Order)
                .Where(r => r.CustomerId == CustId).OrderByDescending(r => r.RequestedAt).ToListAsync();
            return View(returns);
        }

        [HttpPost]
        public async Task<IActionResult> RequestReturn(int orderId, string reason)
        {
            if (!IsLogged) return Guard();
            var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == CustId);
            if (order == null) return NotFound();

            bool dup = await _db.ReturnRequests.AnyAsync(r => r.OrderId == orderId && r.CustomerId == CustId);
            if (!dup)
            {
                _db.ReturnRequests.Add(new ReturnRequest { OrderId = orderId, CustomerId = CustId!.Value, Reason = reason?.Trim() ?? "Customer requested return" });
                order.Status = OrderStatus.ReturnRefund;
                await _db.SaveChangesAsync();
                TempData["Success"] = "Return request submitted.";
            }
            else TempData["Error"] = "A return already exists for this order.";
            return RedirectToAction("MyReturns");
        }
    }
}

// ── Request DTOs ───────────────────────────────────────────────────────
public record AddToCartRequest(int ProductId, int Quantity = 1);
public record UpdateCartRequest(int CartItemId, int Quantity);
public record RemoveCartRequest(int CartItemId);
public record WishlistRequest(int ProductId);