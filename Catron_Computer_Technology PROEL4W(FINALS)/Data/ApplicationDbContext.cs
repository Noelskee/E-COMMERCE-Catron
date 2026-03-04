using Catron_Computer_Technology_PROEL4W_FINALS_.Models;

using Microsoft.EntityFrameworkCore;

namespace Catron_Computer_Technology_PROEL4W_FINALS_.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<CustomerAddress> CustomerAddresses => Set<CustomerAddress>();
        public DbSet<Admin> Admins => Set<Admin>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<WishListItem> WishListItems => Set<WishListItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<DeliveryTracking> DeliveryTrackings => Set<DeliveryTracking>();
        public DbSet<Receipt> Receipts => Set<Receipt>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<ReturnRequest> ReturnRequests => Set<ReturnRequest>();

        protected override void OnModelCreating(ModelBuilder mb)
        {
            base.OnModelCreating(mb);

            // ── Unique indexes ────────────────────────────────────────────────
            mb.Entity<Customer>().HasIndex(c => c.Email).IsUnique();
            mb.Entity<Admin>().HasIndex(a => a.Username).IsUnique();
            mb.Entity<Admin>().HasIndex(a => a.Email).IsUnique();
            mb.Entity<CartItem>().HasIndex(c => new { c.CustomerId, c.ProductId }).IsUnique();
            mb.Entity<WishListItem>().HasIndex(w => new { w.CustomerId, w.ProductId }).IsUnique();

            // ── Receipt 1-to-1 ───────────────────────────────────────────────
            mb.Entity<Order>()
                .HasOne(o => o.Receipt)
                .WithOne(r => r.Order)
                .HasForeignKey<Receipt>(r => r.OrderId);

            // ── Fix SQL Server cascade cycle ─────────────────────────────────
            mb.Entity<ReturnRequest>()
                .HasOne(r => r.Order).WithMany()
                .HasForeignKey(r => r.OrderId).OnDelete(DeleteBehavior.NoAction);
            mb.Entity<ReturnRequest>()
                .HasOne(r => r.Customer).WithMany(c => c.ReturnRequests)
                .HasForeignKey(r => r.CustomerId).OnDelete(DeleteBehavior.NoAction);
            mb.Entity<OrderItem>()
                .HasOne(i => i.Product).WithMany()
                .HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.NoAction);

            // ── SEED DATA ─────────────────────────────────────────────────────
            // HasData seeds are applied once via migration (Add-Migration + Update-Database).
            // After that, Migrate() on startup just checks __EFMigrationsHistory and skips.
            // Customers & Admins registered via the app are NEVER touched by seeds.

            var s = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            // Default Admin (change password after first login)
            mb.Entity<Admin>().HasData(new Admin
            {
                Id = 1,
                Username = "admin",
                Email = "admin@catrontech.ph",
                // BCrypt hash of "Admin@123"
                PasswordHash = "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
                CreatedAt = s
            });

            // Categories
            mb.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Laptops", IconClass = "fas fa-laptop", Description = "Portable computing" },
                new Category { Id = 2, Name = "Desktops", IconClass = "fas fa-desktop", Description = "Desktop computers" },
                new Category { Id = 3, Name = "Office Supplies", IconClass = "fas fa-briefcase", Description = "Office essentials" },
                new Category { Id = 4, Name = "School Supplies", IconClass = "fas fa-book", Description = "School essentials" },
                new Category { Id = 5, Name = "Mobile Devices", IconClass = "fas fa-mobile-alt", Description = "Phones & tablets" },
                new Category { Id = 6, Name = "Software", IconClass = "fas fa-compact-disc", Description = "Software licenses" },
                new Category { Id = 7, Name = "Hardware", IconClass = "fas fa-microchip", Description = "PC components" },
                new Category { Id = 8, Name = "Printers", IconClass = "fas fa-print", Description = "Printers & scanners" }
            );

            // ── ALL 45 Products ───────────────────────────────────────────────
            mb.Entity<Product>().HasData(
                // ── LAPTOPS (Cat 1) ──
                new Product
                {
                    Id = 1,
                    CategoryId = 1,
                    Brand = "Dell",
                    Name = "Dell XPS 15 Laptop",
                    Price = 65999m,
                    Stock = 45,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Powerful laptop with 11th Gen Intel Core processors, stunning display, and premium build quality.",
                    ImageUrl = "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/touch-black/notebook-xps-15-9530-t-black-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=654&qlt=100,1&resMode=sharp2&size=654,402&chrss=full"
                },
                new Product
                {
                    Id = 2,
                    CategoryId = 1,
                    Brand = "HP",
                    Name = "HP Pavilion Gaming Laptop",
                    Price = 52999m,
                    Stock = 32,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Gaming laptop with NVIDIA GTX graphics, fast refresh display, and excellent cooling.",
                    ImageUrl = "https://m.media-amazon.com/images/I/61YT2eKwcbL._AC_SL1004_.jpg"
                },
                new Product
                {
                    Id = 3,
                    CategoryId = 1,
                    Brand = "Acer",
                    Name = "Acer Nitro 5 Gaming Laptop",
                    Price = 42999m,
                    Stock = 28,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "A mid-range gaming laptop powered by Ryzen 5 and GTX graphics.",
                    ImageUrl = "https://m.media-amazon.com/images/I/71ctRE34RuL._AC_SL1500_.jpg"
                },
                new Product
                {
                    Id = 4,
                    CategoryId = 1,
                    Brand = "Lenovo",
                    Name = "Lenovo ThinkPad E14",
                    Price = 38999m,
                    Stock = 50,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Business laptop with robust security, professional design, and reliable performance.",
                    ImageUrl = "https://p1-ofp.static.pub//fes/cms/2024/03/04/b3npyptzskczdme2uxdo3e9f65zvqd800519.jpg"
                },
                new Product
                {
                    Id = 5,
                    CategoryId = 1,
                    Brand = "ASUS",
                    Name = "ASUS VivoBook 15",
                    Price = 32999m,
                    Stock = 65,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Lightweight laptop perfect for students and professionals, with all-day battery life.",
                    ImageUrl = "https://pcx.com.ph/cdn/shop/files/LT-ASUS-VIVOBOOK-15-X1504VA-NJ1622WSM-I5-OFFICE-1_437cd931-856b-442b-b4cb-97f034a7e121.jpg"
                },

                // ── DESKTOPS (Cat 2) ──
                new Product
                {
                    Id = 6,
                    CategoryId = 2,
                    Brand = "HP",
                    Name = "HP Desktop Elite Tower",
                    Price = 35999m,
                    Stock = 38,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Powerful desktop PC for business and creative work with expandable storage.",
                    ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkQxMACaBfiPJ0KtjghQzfVo3DesYYWfzM9A&s"
                },
                new Product
                {
                    Id = 7,
                    CategoryId = 2,
                    Brand = "Dell",
                    Name = "Dell OptiPlex Desktop",
                    Price = 32999m,
                    Stock = 42,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Reliable desktop computer for office work with energy-efficient components.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/ph-11134207-81ztm-mee0ucd5k1z612"
                },
                new Product
                {
                    Id = 8,
                    CategoryId = 2,
                    Brand = "Lenovo",
                    Name = "Lenovo IdeaCentre Desktop",
                    Price = 28999m,
                    Stock = 55,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Compact desktop with modern design, perfect for home and small office use.",
                    ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc3G--14y8J_m4BdHMX_BYLypUvu6OSsp2zQ&s"
                },
                new Product
                {
                    Id = 9,
                    CategoryId = 2,
                    Brand = "ASUS",
                    Name = "ASUS Gaming Desktop",
                    Price = 55999m,
                    Stock = 22,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "High-performance gaming desktop with RGB lighting and powerful graphics card.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/ph-11134207-7r98t-lpeiomr12e3ted_tn.webp"
                },
                new Product
                {
                    Id = 10,
                    CategoryId = 2,
                    Brand = "Acer",
                    Name = "Acer Aspire Desktop",
                    Price = 25999m,
                    Stock = 70,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Budget-friendly desktop computer for everyday computing tasks.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/ph-11134207-81ztj-mhmt2qer9q8451_tn.webp"
                },

                // ── MOBILE DEVICES (Cat 5) ──
                new Product
                {
                    Id = 11,
                    CategoryId = 5,
                    Brand = "Samsung",
                    Name = "Samsung Galaxy S23",
                    Price = 45999m,
                    Stock = 85,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Latest flagship smartphone with advanced camera system and powerful performance.",
                    ImageUrl = "https://d1rlzxa98cyc61.cloudfront.net/catalog/product/1/8/186715_2_1.jpg?auto=webp&format=pjpg&width=640"
                },
                new Product
                {
                    Id = 12,
                    CategoryId = 5,
                    Brand = "Apple",
                    Name = "iPhone 14 Pro",
                    Price = 62999m,
                    Stock = 60,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Premium iPhone with Dynamic Island, Pro camera system, and A16 Bionic chip.",
                    ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm7JS13wDMiCD9C0el9ZDlfdBeeJjYuTPwAA&s"
                },
                new Product
                {
                    Id = 13,
                    CategoryId = 5,
                    Brand = "Apple",
                    Name = "iPad Air 5th Gen",
                    Price = 35999m,
                    Stock = 48,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Versatile tablet with M1 chip, perfect for creativity and productivity.",
                    ImageUrl = "https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111887_sp866-ipad-air-5gen.png"
                },
                new Product
                {
                    Id = 14,
                    CategoryId = 5,
                    Brand = "Samsung",
                    Name = "Samsung Galaxy Tab S8",
                    Price = 32999m,
                    Stock = 52,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Android tablet with S Pen, great for note-taking and multimedia.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/ph-11134207-7r98t-lm49ngmnhu33e4"
                },
                new Product
                {
                    Id = 15,
                    CategoryId = 5,
                    Brand = "OnePlus",
                    Name = "OnePlus 11",
                    Price = 38999m,
                    Stock = 42,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Fast-charging smartphone with flagship specs at competitive price.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/cn-11134207-7ras8-m0dyi7kb1vf2b8"
                },

                // ── SCHOOL SUPPLIES (Cat 4) ──
                new Product
                {
                    Id = 16,
                    CategoryId = 4,
                    Brand = "Mongol",
                    Name = "Notebook Set (5 Pack)",
                    Price = 299m,
                    Stock = 200,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Quality notebooks perfect for students, with ruled pages and durable covers.",
                    ImageUrl = "https://static.wixstatic.com/media/e57753_cafb1a4da53e4bacafde1f9bbc9796ad~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg"
                },
                new Product
                {
                    Id = 17,
                    CategoryId = 4,
                    Brand = "Pilot",
                    Name = "Pen Set Professional",
                    Price = 199m,
                    Stock = 350,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "High-quality ballpoint pens for smooth writing, available in multiple colors.",
                    ImageUrl = "https://cf.shopee.ph/file/ph-11134207-7r98p-lva2lp32b8yab7"
                },
                new Product
                {
                    Id = 18,
                    CategoryId = 4,
                    Brand = "Casio",
                    Name = "Casio Scientific Calculator",
                    Price = 899m,
                    Stock = 120,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Advanced calculator for mathematics and science students.",
                    ImageUrl = "https://cf.shopee.ph/file/ph-11134207-81zto-meqmwxcxlt6o80"
                },
                new Product
                {
                    Id = 19,
                    CategoryId = 4,
                    Brand = "Herschel",
                    Name = "Herschel Backpacks",
                    Price = 1299m,
                    Stock = 95,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Durable school backpack with multiple compartments and laptop sleeve.",
                    ImageUrl = "https://i.ebayimg.com/images/g/RFQAAOSwbn1ePvgc/s-l1200.jpg"
                },
                new Product
                {
                    Id = 20,
                    CategoryId = 4,
                    Brand = "Modanu",
                    Name = "Modanu Art Supplies Kit",
                    Price = 899m,
                    Stock = 75,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Complete art kit with pencils, markers, and drawing paper.",
                    ImageUrl = "https://i5.walmartimages.com/seo/MODANU-150-Pcs-Art-Supplies-Kids-Deluxe-Kids-Art-Set-Drawing-Painting-Portable-Art-Box-Coloring-Supplies-Art-Kits-Great-Gift-Kids-Toddlers-Beginners_11b13511-69e8-401d-95e7-fe79a5699ad0.0a957a8d6a6cb117afa5b05348dde4e7.jpeg"
                },

                // ── OFFICE SUPPLIES (Cat 3) ──
                new Product
                {
                    Id = 21,
                    CategoryId = 3,
                    Brand = "Generic",
                    Name = "Office Gaming Chair",
                    Price = 5999m,
                    Stock = 45,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Comfortable office chair with lumbar support and adjustable height.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/ph-11134207-7rasl-m794h3uglgt198"
                },
                new Product
                {
                    Id = 22,
                    CategoryId = 3,
                    Brand = "Generic",
                    Name = "Wooden Office Desk Organizers",
                    Price = 599m,
                    Stock = 150,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Keep your workspace tidy with this comprehensive organizer set.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/780b78eb597044a02af4f38bedcd0254"
                },
                new Product
                {
                    Id = 23,
                    CategoryId = 3,
                    Brand = "HP",
                    Name = "HP LaserJet Pro MFP 3103fdw",
                    Price = 8999m,
                    Stock = 32,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Fast and reliable laser printer for office use with wireless connectivity.",
                    ImageUrl = "https://elnstore.com/cdn/shop/files/c08340517.png?v=1749465631&width=493"
                },
                new Product
                {
                    Id = 24,
                    CategoryId = 3,
                    Brand = "Generic",
                    Name = "File Cabinet 4-Drawer",
                    Price = 4999m,
                    Stock = 28,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Secure file storage cabinet with lock for important documents.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/ph-11134207-7r991-lloj6psow6mn4d"
                },
                new Product
                {
                    Id = 25,
                    CategoryId = 3,
                    Brand = "Generic",
                    Name = "Whiteboard Magnetic",
                    Price = 1299m,
                    Stock = 60,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Large whiteboard for presentations and brainstorming sessions.",
                    ImageUrl = "https://smstationery.com.ph/cdn/shop/files/10090931-MAGNETICWHITEBOARDWPEN20X30ALUMINUMFRAME.jpg?v=1735806933"
                },

                // ── SOFTWARE (Cat 6) ──
                new Product
                {
                    Id = 26,
                    CategoryId = 6,
                    Brand = "Microsoft",
                    Name = "Microsoft Office 2021",
                    Price = 6999m,
                    Stock = 500,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Complete productivity suite with Word, Excel, PowerPoint, and more.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/ph-11134275-7ra0r-mbs8xyq14r3v3d_tn.webp"
                },
                new Product
                {
                    Id = 27,
                    CategoryId = 6,
                    Brand = "Adobe",
                    Name = "Adobe Creative Cloud",
                    Price = 2999m,
                    Stock = 999,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Access to Photoshop, Illustrator, Premiere Pro and more. Monthly subscription.",
                    ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg/512px-Adobe_Creative_Cloud_rainbow_icon.svg.png"
                },
                new Product
                {
                    Id = 28,
                    CategoryId = 6,
                    Brand = "Microsoft",
                    Name = "Windows 11 Pro",
                    Price = 8999m,
                    Stock = 300,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Latest Windows operating system with advanced features for professionals.",
                    ImageUrl = "https://down-id.img.susercontent.com/file/id-11134207-7rasl-m3rdu74g6amwaa"
                },
                new Product
                {
                    Id = 29,
                    CategoryId = 6,
                    Brand = "Norton",
                    Name = "Antivirus Norton 360",
                    Price = 1499m,
                    Stock = 450,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Comprehensive security suite to protect your devices from threats.",
                    ImageUrl = "https://cf.shopee.ph/file/sg-11134202-7rdwl-mcbk7c2itelz5c"
                },
                new Product
                {
                    Id = 30,
                    CategoryId = 6,
                    Brand = "Autodesk",
                    Name = "AutoCAD 2024",
                    Price = 12999m,
                    Stock = 200,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Professional CAD software for 2D and 3D design. Annual subscription.",
                    ImageUrl = "https://cf.shopee.ph/file/ph-11134207-81ztk-mhy8xzrn2j2da6"
                },

                // ── HARDWARE (Cat 7) ──
                new Product
                {
                    Id = 31,
                    CategoryId = 7,
                    Brand = "Intel",
                    Name = "Intel Core i7-13700K",
                    Price = 18999m,
                    Stock = 55,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "13th Gen Intel processor with 16 cores for gaming and content creation.",
                    ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj5WKK0gpAh8suNLv1r02YDvjDfADQGl2x5w&s"
                },
                new Product
                {
                    Id = 32,
                    CategoryId = 7,
                    Brand = "NVIDIA",
                    Name = "NVIDIA RTX 4070",
                    Price = 32999m,
                    Stock = 32,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "High-performance graphics card for 4K gaming and ray tracing.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/ph-11134207-7rase-m7c48lpgewkrd4_tn.webp"
                },
                new Product
                {
                    Id = 33,
                    CategoryId = 7,
                    Brand = "Corsair",
                    Name = "Corsair Vengeance RGB 32GB",
                    Price = 5999m,
                    Stock = 88,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "High-speed DDR5 RAM with RGB lighting for gaming PCs.",
                    ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk4lDR8GhJjMzQMGJzlDuIwQgMkDwxBCHv-g&s"
                },
                new Product
                {
                    Id = 34,
                    CategoryId = 7,
                    Brand = "Samsung",
                    Name = "Samsung 980 PRO 2TB SSD",
                    Price = 8999m,
                    Stock = 65,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Ultra-fast NVMe SSD with PCIe 4.0 for lightning-quick load times.",
                    ImageUrl = "https://cf.shopee.ph/file/4cff930e948afe87f52012cd1569c5f9"
                },
                new Product
                {
                    Id = 35,
                    CategoryId = 7,
                    Brand = "ASUS",
                    Name = "ASUS ROG Strix B650 Motherboard",
                    Price = 12999m,
                    Stock = 42,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Premium AMD motherboard with WiFi 6E and PCIe 5.0 support.",
                    ImageUrl = "https://ecommerce.datablitz.com.ph/cdn/shop/files/g5s6dg45sdg.jpg?v=1760254901"
                },

                // ── PRINTERS (Cat 8) ──
                new Product
                {
                    Id = 36,
                    CategoryId = 8,
                    Brand = "Canon",
                    Name = "Canon PIXMA G3020",
                    Price = 8999m,
                    Stock = 45,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "All-in-one wireless ink tank printer with high page yield for home and office.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/sg-11134201-23010-gzbwi62p80lv29"
                },
                new Product
                {
                    Id = 37,
                    CategoryId = 8,
                    Brand = "Epson",
                    Name = "Epson EcoTank L3250",
                    Price = 9999m,
                    Stock = 38,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Ink tank printer with WiFi connectivity and low cost per page.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/ph-11134207-7rash-m9tnocfbnj8z6a"
                },
                new Product
                {
                    Id = 38,
                    CategoryId = 8,
                    Brand = "Brother",
                    Name = "Brother DCP-T720DW",
                    Price = 10999m,
                    Stock = 32,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Compact 3-in-1 ink tank printer with automatic duplex printing.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/ph-11134207-7ra0t-mbov2l15ivla75"
                },
                new Product
                {
                    Id = 39,
                    CategoryId = 8,
                    Brand = "HP",
                    Name = "HP Smart Tank 585",
                    Price = 11999m,
                    Stock = 28,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "All-in-one wireless printer with Smart app connectivity and high capacity tanks.",
                    ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzecVEs6pd77RNbCh9J_EYeJwx9uPp40P8eQ&s"
                },
                new Product
                {
                    Id = 40,
                    CategoryId = 8,
                    Brand = "Canon",
                    Name = "Canon imageCLASS MF445dw",
                    Price = 18999m,
                    Stock = 25,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Monochrome laser multifunction printer for business with duplex scanning.",
                    ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRveIAxLfAx5A_IhU3_BV9HqRZ8eKlQInA7Tg&s"
                },
                new Product
                {
                    Id = 41,
                    CategoryId = 8,
                    Brand = "Epson",
                    Name = "Epson L5290",
                    Price = 13999m,
                    Stock = 35,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "WiFi all-in-one ink tank printer with ADF and fax capability.",
                    ImageUrl = "https://down-ph.img.susercontent.com/file/ph-11134207-7r98q-lw54tsqn6vdt0a"
                },
                new Product
                {
                    Id = 42,
                    CategoryId = 8,
                    Brand = "HP",
                    Name = "HP LaserJet Pro M404dn",
                    Price = 15999m,
                    Stock = 22,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Fast monochrome laser printer with network connectivity for offices.",
                    ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4eDQojLAsUxqhD0faZiiV_26OcbDnu5NgpA&s"
                },
                new Product
                {
                    Id = 43,
                    CategoryId = 8,
                    Brand = "Brother",
                    Name = "Brother HL-L2375DW",
                    Price = 7999m,
                    Stock = 48,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Compact wireless monochrome laser printer perfect for home offices.",
                    ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4h1vTmIdgz-xVWPWkeSkjJfeJyV46Tz93XQ&s"
                },
                new Product
                {
                    Id = 44,
                    CategoryId = 8,
                    Brand = "Canon",
                    Name = "Canon PIXMA TS5350a",
                    Price = 6999m,
                    Stock = 55,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "Wireless all-in-one inkjet printer with borderless photo printing.",
                    ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1gOPM80VMC4u_NvApTDluVo1JODsCzNQYEg&s"
                },
                new Product
                {
                    Id = 45,
                    CategoryId = 8,
                    Brand = "Epson",
                    Name = "Epson WorkForce WF-2935",
                    Price = 8999m,
                    Stock = 40,
                    IsActive = true,
                    CreatedAt = s,
                    Description = "All-in-one color inkjet printer with ADF and WiFi Direct.",
                    ImageUrl = "https://i8.amplience.net/i/epsonemear/a17761-productpicture-hires-en-int-workforce_wf-2935dwf_02_attribute_rp_flex_2000x2000px"
                }
            );
        }
    }
}