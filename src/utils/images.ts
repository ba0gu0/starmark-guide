// images.ts

import { saveImagePreviewToDB, getStoredImagePreview } from '../utils/storage'; // 引入存储操作

// 从URL下载图片并转换为data URI格式并保存到数据库
export const downloadImageAsBase64 = async (imageUrl: string, siteUrl: string): Promise<void> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const base64Image = await blobToBase64(blob);
    const dataUri = ensureDataUri(base64Image, blob.type);
    await saveImagePreviewToDB(siteUrl, dataUri);
  } catch (error) {
    throw new Error('下载或处理图片失败');
  }
};

// 辅助函数：将Blob转换为Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(blob);
  });
};

// 确保图片数据是完整的data URI格式
function ensureDataUri(base64Image: string, mimeType: string): string {
  if (base64Image.startsWith('data:')) {
    return base64Image; // 已经是data URI格式，直接返回
  }
  return `data:${mimeType};base64,${base64Image}`;
}

// 从数据库查询图片并返回可以直接用于 <img> src 属性的内容
export const showImagePreview = async (siteUrl: string): Promise<string | null> => {
  try {
    const dataUri = await getStoredImagePreview(siteUrl); // 从数据库获取data URI格式的图片数据
    if (dataUri) {
      return dataUri; // 直接返回data URI，无需额外处理
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};
