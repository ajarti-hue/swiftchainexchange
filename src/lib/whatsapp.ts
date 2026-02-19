const PHONE = "233555098098";

export const sendToWhatsApp = (message: string) => {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${PHONE}?text=${encoded}`, "_blank");
};

export const buildGiftCardMessage = (card: string, type: string, amount: string) => {
  return `Hello SwiftChain X! 👋\n\nI'd like to trade a gift card.\n\n🎁 Gift Card: ${card}\n💱 Type: ${type}\n💰 Amount: $${amount}\n\nPlease let me know the next steps!`;
};

export const buildCryptoMessage = (crypto: string, action: string, amount: string) => {
  return `Hello SwiftChain X! 👋\n\nI'd like to ${action} crypto.\n\n🪙 Crypto: ${crypto}\n💱 Action: ${action}\n💰 Amount: $${amount}\n\nPlease let me know the next steps!`;
};
