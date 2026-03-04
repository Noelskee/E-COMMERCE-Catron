using Catron_Computer_Technology_PROEL4W_FINALS_.Data;
using Catron_Computer_Technology_PROEL4W_FINALS_.Helpers;
using Catron_Computer_Technology_PROEL4W_FINALS_.Models;
using Catron_Computer_Technology_PROEL4W_FINALS_.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Catron_Computer_Technology_PROEL4W_FINALS_.Controllers
{
    /// <summary>
    /// AdminController – first page displayed is Admin/Login.
    ///
    /// Views live in:  Views/Admin/
    ///   Auth    : Login, Register, ForgotPassword, ResetPassword
    ///   Core    : Dashboard, Orders, OrderDetail, Products, ProductForm,
    ///             Customers, CustomerDetail, Returns
    /// </summary>
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _db;
        public AdminController(ApplicationDbContext db) => _db = db;

        private bool IsAdmin => HttpContext.Session.GetString("AdminId") != null;

        private IActionResult Guard() => RedirectToAction("Login");

        // ══════════════════════════════════════════════════════════
        //  LOGIN  (default action = first page shown)
        // ══════════════════════════════════════════════════════════

        [HttpGet]
        public IActionResult Login()
        {
            if (IsAdmin) return RedirectToAction("Dashboard");
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(AdminLoginViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var admin = await _db.Admins.FirstOrDefaultAsync(a => a.Username == model.Username);

            if (admin == null || !AdminPasswordHasher.Verify(model.Password, admin.PasswordHash))
            {
                ModelState.AddModelError("", "Invalid username or password.");
                return View(model);
            }

            HttpContext.Session.SetString("AdminId", admin.Id.ToString());
            HttpContext.Session.SetString("AdminUsername", admin.Username);
            return RedirectToAction("Dashboard");
        }

        // ══════════════════════════════════════════════════════════
        //  REGISTER
        // ══════════════════════════════════════════════════════════

        [HttpGet] public IActionResult Register() => View();

        [HttpPost]
        public async Task<IActionResult> Register(AdminRegisterViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            if (await _db.Admins.AnyAsync(a => a.Username == model.Username || a.Email == model.Email))
            {
                ModelState.AddModelError("", "Username or email already exists.");
                return View(model);
            }

            _db.Admins.Add(new Admin
            {
                Username = model.Username.Trim(),
                Email = model.Email.Trim().ToLower(),
                PasswordHash = AdminPasswordHasher.Hash(model.Password)
            });
            await _db.SaveChangesAsync();

            TempData["Success"] = "Admin account created. Please log in.";
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

            var a = await _db.Admins.FirstOrDefaultAsync(x => x.Email == model.Email);
            if (a != null)
            {
                a.ResetToken = AdminPasswordHasher.GenerateResetToken();
                a.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);
                await _db.SaveChangesAsync();
                // TODO: email the link /Admin/ResetPassword?token=...&email=...
            }
            TempData["Info"] = "If that email is registered, a reset link has been sent.";
            return RedirectToAction("Login");
        }

        [HttpGet]
        public IActionResult ResetPassword(string token, string email) =>
            View(new ResetPasswordViewModel { Token = token, Email = email });

        [HttpPost]
        public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var a = await _db.Admins.FirstOrDefaultAsync(x =>
                x.Email == model.Email && x.ResetToken == model.Token && x.ResetTokenExpiry > DateTime.UtcNow);

            if (a == null) { ModelState.AddModelError("", "Invalid or expired link."); return View(model); }

            a.PasswordHash = AdminPasswordHasher.Hash(model.NewPassword);
            a.ResetToken = null;
            a.ResetTokenExpiry = null;
            await _db.SaveChangesAsync();

            TempData["Success"] = "Password reset. Please log in.";
            return RedirectToAction("Login");
        }

        // ══════════════════════════════════════════════════════════
        //  LOGOUT
        // ══════════════════════════════════════════════════════════

        public IActionResult Logout()
        {
            HttpContext.Session.Remove("AdminId");
            HttpContext.Session.Remove("AdminUsername");
            return RedirectToAction("Login");
        }

        // ══════════════════════════════════════════════════════════
        //  DASHBOARD
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> Dashboard()
        {
            if (!IsAdmin) return Guard();

            return View(new AdminDashboardViewModel
            {
                TotalCustomers = await _db.Customers.CountAsync(c => c.IsActive),
                TotalOrders = await _db.Orders.CountAsync(),
                TotalProducts = await _db.Products.CountAsync(p => p.IsActive),
                TotalRevenue = await _db.Orders
                    .Where(o => o.PaymentStatus == PaymentStatus.Paid)
                    .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m,
                RecentOrders = await _db.Orders.AsNoTracking().Include(o => o.Customer).Include(o => o.OrderItems)
                    .OrderByDescending(o => o.CreatedAt).Take(10).ToListAsync(),
                LowStockProducts = await _db.Products.AsNoTracking().Where(p => p.Stock < 5 && p.IsActive).ToListAsync(),
                PendingReturns = await _db.ReturnRequests.AsNoTracking().Include(r => r.Customer).Include(r => r.Order)
                    .Where(r => r.Status == ReturnStatus.Pending).ToListAsync(),
                RecentCustomers = await _db.Customers.AsNoTracking().Include(c => c.Orders)
                    .OrderByDescending(c => c.CreatedAt).Take(8).ToListAsync()
            });
        }

        // ══════════════════════════════════════════════════════════
        //  ORDERS
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> Orders(string filter = "All")
        {
            if (!IsAdmin) return Guard();

            var q = _db.Orders.AsNoTracking().Include(o => o.Customer).Include(o => o.OrderItems).AsQueryable();

            q = filter switch
            {
                "ToPay" => q.Where(o => o.Status == OrderStatus.ToPay),
                "ToShip" => q.Where(o => o.Status == OrderStatus.ToShip),
                "ToReceive" => q.Where(o => o.Status == OrderStatus.ToReceive),
                "Completed" => q.Where(o => o.Status == OrderStatus.Completed),
                "Cancelled" => q.Where(o => o.Status == OrderStatus.Cancelled),
                _ => q
            };

            ViewBag.Filter = filter;
            return View(await q.OrderByDescending(o => o.CreatedAt).ToListAsync());
        }

        public async Task<IActionResult> OrderDetail(int id)
        {
            if (!IsAdmin) return Guard();

            var order = await _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems).ThenInclude(i => i.Product)
                .Include(o => o.DeliveryTrackings)
                .Include(o => o.Receipt)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();
            return View(order);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, OrderStatus status)
        {
            if (!IsAdmin) return Guard();
            var o = await _db.Orders.FindAsync(orderId);
            if (o != null) { o.Status = status; await _db.SaveChangesAsync(); TempData["Success"] = $"Order status updated to {status}."; }
            return RedirectToAction("OrderDetail", new { id = orderId });
        }

        // ══════════════════════════════════════════════════════════
        //  DELIVERY TRACKING
        // ══════════════════════════════════════════════════════════

        [HttpPost]
        public async Task<IActionResult> AddDeliveryTracking(AddDeliveryTrackingViewModel model)
        {
            if (!IsAdmin) return Guard();
            if (!ModelState.IsValid) { TempData["Error"] = "Fill in all required tracking fields."; return RedirectToAction("OrderDetail", new { id = model.OrderId }); }

            _db.DeliveryTrackings.Add(new DeliveryTracking
            {
                OrderId = model.OrderId,
                Status = model.Status,
                Location = model.Location,
                Notes = model.Notes,
                TrackingTime = model.TrackingTime
            });
            await _db.SaveChangesAsync();
            TempData["Success"] = "Tracking update added.";
            return RedirectToAction("OrderDetail", new { id = model.OrderId });
        }

        // ══════════════════════════════════════════════════════════
        //  PRODUCTS
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> Products()
        {
            if (!IsAdmin) return Guard();
            var products = await _db.Products.AsNoTracking().Include(p => p.Category)
                .OrderBy(p => p.Category.Name).ThenBy(p => p.Name).ToListAsync();
            return View(products);
        }

        [HttpGet]
        public async Task<IActionResult> ProductForm(int? id)
        {
            if (!IsAdmin) return Guard();
            var cats = await _db.Categories.ToListAsync();

            if (id.HasValue)
            {
                var p = await _db.Products.FindAsync(id);
                if (p == null) return NotFound();
                return View(new ProductFormViewModel
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    DiscountPrice = p.DiscountPrice,
                    Stock = p.Stock,
                    ImageUrl = p.ImageUrl,
                    Brand = p.Brand,
                    IsActive = p.IsActive,
                    CategoryId = p.CategoryId,
                    Categories = cats
                });
            }
            return View(new ProductFormViewModel { IsActive = true, Categories = cats });
        }

        [HttpPost]
        public async Task<IActionResult> ProductForm(ProductFormViewModel model)
        {
            if (!IsAdmin) return Guard();
            model.Categories = await _db.Categories.ToListAsync();
            if (!ModelState.IsValid) return View(model);

            if (model.Id == 0)
            {
                _db.Products.Add(new Product
                {
                    Name = model.Name,
                    Description = model.Description,
                    Price = model.Price,
                    DiscountPrice = model.DiscountPrice,
                    Stock = model.Stock,
                    ImageUrl = model.ImageUrl,
                    Brand = model.Brand,
                    IsActive = model.IsActive,
                    CategoryId = model.CategoryId
                });
            }
            else
            {
                var p = await _db.Products.FindAsync(model.Id);
                if (p == null) return NotFound();
                p.Name = model.Name; p.Description = model.Description; p.Price = model.Price;
                p.DiscountPrice = model.DiscountPrice; p.Stock = model.Stock; p.ImageUrl = model.ImageUrl;
                p.Brand = model.Brand; p.IsActive = model.IsActive; p.CategoryId = model.CategoryId;
            }

            await _db.SaveChangesAsync();
            TempData["Success"] = model.Id == 0 ? "Product added." : "Product updated.";
            return RedirectToAction("Products");
        }

        [HttpPost]
        public async Task<IActionResult> ToggleProductStatus(int id)
        {
            if (!IsAdmin) return Guard();
            var p = await _db.Products.FindAsync(id);
            if (p != null) { p.IsActive = !p.IsActive; await _db.SaveChangesAsync(); TempData["Success"] = p.IsActive ? "Product activated." : "Product deactivated."; }
            return RedirectToAction("Products");
        }

        // ══════════════════════════════════════════════════════════
        //  CUSTOMERS (manage user details)
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> Customers()
        {
            if (!IsAdmin) return Guard();
            var customers = await _db.Customers.AsNoTracking().Include(c => c.Orders)
                .OrderByDescending(c => c.CreatedAt).ToListAsync();
            return View(customers);
        }

        public async Task<IActionResult> CustomerDetail(int id)
        {
            if (!IsAdmin) return Guard();
            var customer = await _db.Customers
                .Include(c => c.Orders).ThenInclude(o => o.OrderItems).ThenInclude(i => i.Product)
                .Include(c => c.Addresses)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (customer == null) return NotFound();
            return View(new CustomerDetailViewModel
            {
                Customer = customer,
                Addresses = customer.Addresses.ToList(),
                Orders = customer.Orders.OrderByDescending(o => o.CreatedAt).ToList()
            });
        }

        [HttpPost]
        public async Task<IActionResult> ToggleCustomerStatus(int id)
        {
            if (!IsAdmin) return Guard();
            var c = await _db.Customers.FindAsync(id);
            if (c != null) { c.IsActive = !c.IsActive; await _db.SaveChangesAsync(); TempData["Success"] = c.IsActive ? "Customer activated." : "Customer deactivated."; }
            return RedirectToAction("Customers");
        }

        // ══════════════════════════════════════════════════════════
        //  RETURNS & CANCELLATIONS
        // ══════════════════════════════════════════════════════════

        public async Task<IActionResult> Returns()
        {
            if (!IsAdmin) return Guard();
            var returns = await _db.ReturnRequests
                .Include(r => r.Customer).Include(r => r.Order)
                .OrderByDescending(r => r.RequestedAt).ToListAsync();
            return View(returns);
        }

        [HttpPost]
        public async Task<IActionResult> ProcessReturn(int id, ReturnStatus status, string? adminNote)
        {
            if (!IsAdmin) return Guard();
            var r = await _db.ReturnRequests.FindAsync(id);
            if (r != null)
            {
                r.Status = status;
                r.AdminNote = adminNote;
                r.ResolvedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
                TempData["Success"] = $"Return request {status}.";
            }
            return RedirectToAction("Returns");
        }
    }
}