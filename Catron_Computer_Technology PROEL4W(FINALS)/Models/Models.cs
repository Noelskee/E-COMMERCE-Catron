using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Catron_Computer_Technology_PROEL4W_FINALS_.Models
{
    // ══════════════════════════════════════════════════════════════
    //  CUSTOMER
    // ══════════════════════════════════════════════════════════════
    public class Customer
    {
        public int Id { get; set; }

        [Required, StringLength(100)]
        public string FirstName { get; set; } = "";

        [Required, StringLength(100)]
        public string LastName { get; set; } = "";

        [Required, EmailAddress, StringLength(200)]
        public string Email { get; set; } = "";

        [Required]
        public string PasswordHash { get; set; } = "";

        [Phone, StringLength(20)]
        public string? PhoneNumber { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }

        [NotMapped]
        public string FullName => $"{FirstName} {LastName}";

        // Navigation
        public ICollection<CustomerAddress> Addresses { get; set; } = new List<CustomerAddress>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public ICollection<WishListItem> WishListItems { get; set; } = new List<WishListItem>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<ReturnRequest> ReturnRequests { get; set; } = new List<ReturnRequest>();
    }

    public class CustomerAddress
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }

        [Required, StringLength(200)] public string FullName { get; set; } = "";
        [Required, StringLength(500)] public string Address { get; set; } = "";
        [Required, Phone, StringLength(20)] public string PhoneNumber { get; set; } = "";

        public bool IsDefault { get; set; } = false;
        public bool IsBillingDefault { get; set; } = false;

        public Customer Customer { get; set; } = null!;
    }

    // ══════════════════════════════════════════════════════════════
    //  ADMIN  (completely separate from Customer)
    // ══════════════════════════════════════════════════════════════
    public class Admin
    {
        public int Id { get; set; }

        [Required, StringLength(100)] public string Username { get; set; } = "";
        [Required, EmailAddress, StringLength(200)] public string Email { get; set; } = "";
        [Required] public string PasswordHash { get; set; } = "";

        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    // ══════════════════════════════════════════════════════════════
    //  CATEGORY
    // ══════════════════════════════════════════════════════════════
    public class Category
    {
        public int Id { get; set; }

        [Required, StringLength(100)] public string Name { get; set; } = "";
        public string? Description { get; set; }
        public string? IconClass { get; set; }  // e.g. "fas fa-laptop"

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }

    // ══════════════════════════════════════════════════════════════
    //  PRODUCT
    // ══════════════════════════════════════════════════════════════
    public class Product
    {
        public int Id { get; set; }

        [Required, StringLength(200)] public string Name { get; set; } = "";
        public string? Description { get; set; }

        [Required, Column(TypeName = "decimal(18,2)")] public decimal Price { get; set; }
        [Column(TypeName = "decimal(18,2)")] public decimal? DiscountPrice { get; set; }

        public int Stock { get; set; } = 0;
        public string? ImageUrl { get; set; }
        public string? Brand { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<WishListItem> WishListItems { get; set; } = new List<WishListItem>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        [NotMapped]
        public decimal FinalPrice =>
            DiscountPrice.HasValue && DiscountPrice < Price ? DiscountPrice.Value : Price;

        [NotMapped]
        public int? DiscountPercent =>
            DiscountPrice.HasValue && DiscountPrice < Price
                ? (int)Math.Round((1m - DiscountPrice.Value / Price) * 100) : null;
    }

    // ══════════════════════════════════════════════════════════════
    //  CART
    // ══════════════════════════════════════════════════════════════
    public class CartItem
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        public Customer Customer { get; set; } = null!;
        public Product Product { get; set; } = null!;

        [NotMapped] public decimal Subtotal => (Product?.FinalPrice ?? 0) * Quantity;
    }

    // ══════════════════════════════════════════════════════════════
    //  WISH LIST
    // ══════════════════════════════════════════════════════════════
    public class WishListItem
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int ProductId { get; set; }
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        public Customer Customer { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }

    // ══════════════════════════════════════════════════════════════
    //  ENUMS
    // ══════════════════════════════════════════════════════════════
    public enum OrderStatus { ToPay, ToShip, ToReceive, ToReview, Completed, ReturnRefund, Cancelled }
    public enum PaymentMethod { Cash, DebitCard, CreditCard, GCash }
    public enum PaymentStatus { Pending, Paid, Failed, Refunded }
    public enum ReturnStatus { Pending, Approved, Rejected, Completed }

    // ══════════════════════════════════════════════════════════════
    //  ORDER
    // ══════════════════════════════════════════════════════════════
    public class Order
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }

        public string OrderNumber { get; set; } =
            Guid.NewGuid().ToString("N")[..10].ToUpper();

        [Column(TypeName = "decimal(18,2)")] public decimal TotalAmount { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.ToPay;
        public PaymentMethod PaymentMethod { get; set; }
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        public string? GCashReference { get; set; }
        public string? GCashNumber { get; set; }

        [Required] public string ShippingFullName { get; set; } = "";
        [Required] public string ShippingAddress { get; set; } = "";
        [Required] public string ShippingPhone { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }

        public Customer Customer { get; set; } = null!;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<DeliveryTracking> DeliveryTrackings { get; set; } = new List<DeliveryTracking>();
        public Receipt? Receipt { get; set; }
    }

    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")] public decimal UnitPrice { get; set; }

        public Order Order { get; set; } = null!;
        public Product Product { get; set; } = null!;

        [NotMapped] public decimal Subtotal => UnitPrice * Quantity;
    }

    // ══════════════════════════════════════════════════════════════
    //  DELIVERY TRACKING  (admin writes, customer reads)
    // ══════════════════════════════════════════════════════════════
    public class DeliveryTracking
    {
        public int Id { get; set; }
        public int OrderId { get; set; }

        [Required, StringLength(200)] public string Status { get; set; } = "";
        [StringLength(300)] public string? Location { get; set; }
        public string? Notes { get; set; }
        public DateTime TrackingTime { get; set; } = DateTime.UtcNow;

        public Order Order { get; set; } = null!;
    }

    // ══════════════════════════════════════════════════════════════
    //  RECEIPT
    // ══════════════════════════════════════════════════════════════
    public class Receipt
    {
        public int Id { get; set; }
        public int OrderId { get; set; }

        public string ReceiptNumber { get; set; } =
            Guid.NewGuid().ToString("N")[..12].ToUpper();

        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "decimal(18,2)")] public decimal AmountPaid { get; set; }

        public Order Order { get; set; } = null!;
    }

    // ══════════════════════════════════════════════════════════════
    //  REVIEW
    // ══════════════════════════════════════════════════════════════
    public class Review
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int ProductId { get; set; }
        public int OrderId { get; set; }

        [Range(1, 5)] public int Rating { get; set; }
        [StringLength(1000)] public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Customer Customer { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }

    // ══════════════════════════════════════════════════════════════
    //  RETURN REQUEST
    // ══════════════════════════════════════════════════════════════
    public class ReturnRequest
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int CustomerId { get; set; }

        [Required, StringLength(1000)] public string Reason { get; set; } = "";
        public ReturnStatus Status { get; set; } = ReturnStatus.Pending;
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }
        public string? AdminNote { get; set; }

        public Order Order { get; set; } = null!;
        public Customer Customer { get; set; } = null!;
    }
}