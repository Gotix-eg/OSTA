export interface UpdateSettingInput {
  key: string;
  value: string;
  type?: string;
}

import { prisma } from "../../lib/prisma.js";

export const settingsService = {
  async getAllSettings() {
    return prisma.systemSetting.findMany();
  },

  async getSetting(key: string, defaultValue: string = "") {
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    return setting?.value ?? defaultValue;
  },

  async updateSetting(input: UpdateSettingInput) {
    return prisma.systemSetting.upsert({
      where: { key: input.key },
      update: { value: input.value, type: input.type ?? "string" },
      create: { key: input.key, value: input.value, type: input.type ?? "string" }
    });
  },

  async updateSettingsBulk(inputs: UpdateSettingInput[]) {
    return prisma.$transaction(
      inputs.map(input => 
        prisma.systemSetting.upsert({
          where: { key: input.key },
          update: { value: input.value },
          create: { key: input.key, value: input.value, type: input.type ?? "string" }
        })
      )
    );
  }
};
