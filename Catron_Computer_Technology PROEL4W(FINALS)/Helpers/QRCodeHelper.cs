namespace Catron_Computer_Technology_PROEL4W_FINALS_.Helpers
{
    /// <summary>Generates Base64-encoded PNG QR codes for GCash payment.</summary>
    public static class QRCodeHelper
    {
        public static string? GenerateBase64(string text)
        {
            try
            {
                using var gen = new QRCoder.QRCodeGenerator();
                var data = gen.CreateQrCode(text, QRCoder.QRCodeGenerator.ECCLevel.Q);
                using var code = new QRCoder.PngByteQRCode(data);
                return Convert.ToBase64String(code.GetGraphic(10));
            }
            catch { return null; }
        }
    }
}