namespace Catron_Computer_Technology_PROEL4W_FINALS_.Helpers
{
    /// <summary>
    /// Handles all password hashing and verification for Admin accounts.
    /// Uses BCrypt with a higher work factor of 13 for privileged credentials.
    /// </summary>
    public static class AdminPasswordHasher
    {
        private const int WorkFactor = 13;

        /// <summary>Hash a plain-text admin password.</summary>
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

        /// <summary>Generate a URL-safe random reset token for admin accounts.</summary>
        public static string GenerateResetToken()
            => Convert.ToBase64String(Guid.NewGuid().ToByteArray())
               .Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }
}