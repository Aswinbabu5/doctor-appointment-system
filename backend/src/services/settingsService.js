import { prisma } from '../config/db.js';

export class SettingsService {
  static async getSettings() {
    let settings = await prisma.appSetting.findFirst();
    if (!settings) {
      settings = await prisma.appSetting.create({
        data: {
          appName: 'DocCare Connect',
          commissionType: 'PERCENTAGE',
          commissionValue: 10.00,
          currency: 'INR',
          currencySymbol: '₹',
          supportEmail: 'support@doccare.com',
          cancellationCutoffHours: 24
        }
      });
    }
    return settings;
  }

  static async updateSettings(data) {
    let settings = await prisma.appSetting.findFirst();
    if (!settings) {
      return await prisma.appSetting.create({ data });
    }

    return await prisma.appSetting.update({
      where: { id: settings.id },
      data: {
        appName: data.appName,
        logoUrl: data.logoUrl,
        commissionType: data.commissionType,
        commissionValue: data.commissionValue,
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        supportEmail: data.supportEmail,
        cancellationCutoffHours: data.cancellationCutoffHours
      }
    });
  }
}
