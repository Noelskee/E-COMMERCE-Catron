namespace Catron_Computer_Technology_PROEL4W_FINALS_.Helpers
{
    /// <summary>
    /// Handles all password hashing and verification for Customer accounts.
    /// Uses BCrypt with work factor 12.
    /// </summary>
    public static class CustomerPasswordHasher
    {
        private const int WorkFactor = 12;

        /// <summary>Hash a plain-text customer password.</summary>
        public static string Hash(string plainPassword)
        {
            if (string.IsNullOrWhiteSpace(plainPassword))
                throw new ArgumentException("Password cannot be empty.", nameof(plainPassword));
            return BCrypt.Net.BCrypt.HashPassword(plainPassword, WorkFactor);
        }

        /// <summary>Verify a plain-text password against a stored BCrypt hash.</summary>
        public static bool Verify(string plainPassword, string hashedPassword)
        {
            if (string.IsNullOrWhiteSpace(plainPassword) || string.IsNullOrWhiteSpace(hashedPassword))
                return false;
            return BCrypt.Net.BCrypt.Verify(plainPassword, hashedPassword);
        }

        /// <summary>Generate a URL-safe random reset token.</summary>
        public static string GenerateResetToken()
            => Convert.ToBase64String(Guid.NewGuid().ToByteArray())
               .Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }
}