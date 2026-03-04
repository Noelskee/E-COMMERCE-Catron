using System.ComponentModel.DataAnnotations;

namespace Catron_Computer_Technology_PROEL4W_FINALS_.Models.ViewModels
{
    // ══════════════════════════════════════════════════════════════
    //  CUSTOMER AUTH
    // ══════════════════════════════════════════════════════════════
    public class CustomerLoginViewModel
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Enter a valid email.")]
        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Password is required.")]
        [DataType(DataType.Password)]
        public string Password { get; set; } = "";

        public bool RememberMe { get; set; }
    }

    public class CustomerRegisterViewModel
    {
        [Required(ErrorMessage = "First name is required."), StringLength(100)]
        public string FirstName { get; set; } = "";

        [Required(ErrorMessage = "Last name is required."), StringLength(100)]
        public string LastName { get; set; } = "";

        [Required(ErrorMessage = "Email is required."), EmailAddress]
        public string Email { get; set; } = "";

        [Phone] public string? PhoneNumber { get; set; }

        [Required, DataType(DataType.Password), MinLength(6, ErrorMessage = "Minimum 6 characters.")]
        public string Password { get; set; } = "";

        [Required, DataType(DataType.Password), Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; } = "";
    }

    // ══════════════════════════════════════════════════════════════
    //  ADMIN AUTH
    // ══════════════════════════════════════════════════════════════
    public class AdminLoginViewModel
    {
        [Required(ErrorMessage = "Username is required.")]
        public string Username { get; set; } = "";

        [Required(ErrorMessage = "Password is required."), DataType(DataType.Password)]
        public string Password { get; set; } = "";
    }

    public class AdminRegisterViewModel
    {
        [Required, StringLength(100)] public string Username { get; set; } = "";

        [Required, EmailAddress] public string Email { get; set; } = "";

        [Required, DataType(DataType.Password), MinLength(6, ErrorMessage = "Minimum 6 characters.")]
        public string Password { get; set; } = "";

        [Required, DataType(DataType.Password), Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; } = "";
    }

    // ══════════════════════════════════════════════════════════════
    //  SHARED AUTH
    // ══════════════════════════════════════════════════════════════
    public class ForgotPasswordViewModel
    {
        [Required, EmailAddress] public string Email { get; set; } = "";
    }

    public class ResetPasswordViewModel
    {
        [Required] public string Token { get; set; } = "";
        [Required, EmailAddress] public string Email { get; set; } = "";

        [Required, DataType(DataType.Password), MinLength(6)]
        public string NewPassword { get; set; } = "";

        [Required, DataType(DataType.Password), Compare("NewPassword", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; } = "";
    }

    // ══════════════════════════════════════════════════════════════
    //  CUSTOMER – HOME
    // ══════════════════════════════════════════════════════════════
    public class HomeViewModel
    {
        public IEnumerable<Product> FeaturedProducts { get; set; } = new List<Product>();
        public IEnumerable<Category> Categories { get; set; } = new List<Category>();
    }

    // ══════════════════════════════════════════════════════════════
    //  CUSTOMER – PRODUCTS
    // ══════════════════════════════════════════════════════════════
    public class ProductListViewModel
    {
        public IEnumerable<Product> Products { get; set; } = new List<Product>();
        public IEnumerable<Category> Categories { get; set; } = new List<Category>();
        public int? SelectedCategoryId { get; set; }
        public string? SearchQuery { get; set; }
        public int CurrentPage { get; set; } = 1;
        public int TotalPages { get; set; } = 1;
        public int TotalItems { get; set; }
    }

    public class ProductDetailViewModel
    {
        public Product Product { get; set; } = null!;
        public IEnumerable<Review> Reviews { get; set; } = new List<Review>();
        public IEnumerable<Product> RelatedProducts { get; set; } = new List<Product>();
        public bool IsInWishlist { get; set; }
        public double AverageRating { get; set; }
    }

    // ══════════════════════════════════════════════════════════════
    //  CUSTOMER – CART
    // ══════════════════════════════════════════════════════════════
    public class CartViewModel
    {
        public IEnumerable<CartItem> CartItems { get; set; } = new List<CartItem>();
        public decimal TotalAmount { get; set; }
        public int TotalItems { get; set; }
    }

    // ══════════════════════════════════════════════════════════════
    //  CUSTOMER – CHECKOUT
    // ══════════════════════════════════════════════════════════════
    public class CheckoutViewModel
    {
        public IEnumerable<CartItem> CartItems { get; set; } = new List<CartItem>();
        public decimal TotalAmount { get; set; }
        public List<CustomerAddress> SavedAddresses { get; set; } = new();

        // ── FIX: tracks which saved address radio button the customer picked.
        //         When set, PlaceOrder loads the address from DB instead of
        //         relying on the text fields (which may be empty/null).
        public int? SelectedAddressId { get; set; }

        [Required(ErrorMessage = "Full name is required.")]
        public string ShippingFullName { get; set; } = "";

        [Required(ErrorMessage = "Address is required.")]
        public string ShippingAddress { get; set; } = "";

        [Required(ErrorMessage = "Phone number is required."), Phone]
        public string ShippingPhone { get; set; } = "";
    }

    // ══════════════════════════════════════════════════════════════
    //  CUSTOMER – PAYMENT
    // ══════════════════════════════════════════════════════════════
    public class PaymentViewModel
    {
        public Order Order { get; set; } = null!;
        public PaymentMethod SelectedMethod { get; set; }
        public string? GCashNumber { get; set; }
        public string? QrCodeBase64 { get; set; }
    }

    // ══════════════════════════════════════════════════════════════
    //  CUSTOMER – ACCOUNT
    // ══════════════════════════════════════════════════════════════
    public class AccountDashboardViewModel
    {
        public Customer Customer { get; set; } = null!;
        public IEnumerable<Order> RecentOrders { get; set; } = new List<Order>();
    }

    public class ManageAccountViewModel
    {
        public Customer Customer { get; set; } = null!;
        public List<CustomerAddress> Addresses { get; set; } = new();
        public CustomerAddress? DefaultBillingAddress { get; set; }
        public List<Order> RecentOrders { get; set; } = new();
    }

    public class UpdateProfileViewModel
    {
        [Required, StringLength(100)] public string FirstName { get; set; } = "";
        [Required, StringLength(100)] public string LastName { get; set; } = "";
        [Phone] public string? PhoneNumber { get; set; }
    }

    public class OrderListViewModel
    {
        public IEnumerable<Order> Orders { get; set; } = new List<Order>();
        public string Filter { get; set; } = "All";
    }

    // ══════════════════════════════════════════════════════════════
    //  ADMIN – DASHBOARD
    // ══════════════════════════════════════════════════════════════
    public class AdminDashboardViewModel
    {
        public int TotalCustomers { get; set; }
        public int TotalOrders { get; set; }
        public int TotalProducts { get; set; }
        public decimal TotalRevenue { get; set; }
        public IEnumerable<Order> RecentOrders { get; set; } = new List<Order>();
        public IEnumerable<Product> LowStockProducts { get; set; } = new List<Product>();
        public IEnumerable<ReturnRequest> PendingReturns { get; set; } = new List<ReturnRequest>();
        public IEnumerable<Customer> RecentCustomers { get; set; } = new List<Customer>();
    }

    // ══════════════════════════════════════════════════════════════
    //  ADMIN – PRODUCT FORM
    // ══════════════════════════════════════════════════════════════
    public class ProductFormViewModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Product name is required."), StringLength(200)]
        public string Name { get; set; } = "";

        public string? Description { get; set; }

        [Required, Range(0.01, 9999999, ErrorMessage = "Price must be > 0.")]
        public decimal Price { get; set; }

        [Range(0.01, 9999999)] public decimal? DiscountPrice { get; set; }

        [Range(0, int.MaxValue)] public int Stock { get; set; }

        public string? ImageUrl { get; set; }
        public string? Brand { get; set; }
        public bool IsActive { get; set; } = true;

        [Required(ErrorMessage = "Please select a category.")]
        public int CategoryId { get; set; }

        public IEnumerable<Category> Categories { get; set; } = new List<Category>();
    }

    // ══════════════════════════════════════════════════════════════
    //  ADMIN – DELIVERY TRACKING
    // ══════════════════════════════════════════════════════════════
    public class AddDeliveryTrackingViewModel
    {
        public int OrderId { get; set; }

        [Required(ErrorMessage = "Status is required."), StringLength(200)]
        public string Status { get; set; } = "";

        [StringLength(300)] public string? Location { get; set; }
        public string? Notes { get; set; }
        public DateTime TrackingTime { get; set; } = DateTime.Now;
    }

    // ══════════════════════════════════════════════════════════════
    //  ADMIN – CUSTOMER DETAIL
    // ══════════════════════════════════════════════════════════════
    public class CustomerDetailViewModel
    {
        public Customer Customer { get; set; } = null!;
        public List<CustomerAddress> Addresses { get; set; } = new();
        public List<Order> Orders { get; set; } = new();
    }
}