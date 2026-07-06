/**
 * Portos chineses de hub comercial — complemento ao catálogo UN/LOCODE.
 * Fonte: UN/LOCODE (UNECE) + hubs citados em operação COMEX China→BR.
 * SSOT para seed-portos-china-hub-comercio.ts e seed-portos.ts (Bid Frete).
 */

export type PortoChinaHubComercio = {
  codigo_unlocode_porto: string
  nome_porto: string
  latitude_porto: number
  longitude_porto: number
}

export const PORTOS_CHINA_HUB_COMERCIO: PortoChinaHubComercio[] = [
  // Bohai / costa norte
  { codigo_unlocode_porto: 'CNDLC', nome_porto: 'Dalian', latitude_porto: 38.914, longitude_porto: 121.614 },
  { codigo_unlocode_porto: 'CNYIK', nome_porto: 'Yingkou', latitude_porto: 40.667, longitude_porto: 122.235 },
  { codigo_unlocode_porto: 'CNQHD', nome_porto: 'Qinhuangdao', latitude_porto: 39.939, longitude_porto: 119.601 },
  { codigo_unlocode_porto: 'CNTXG', nome_porto: 'Tianjin (Xingang)', latitude_porto: 38.986, longitude_porto: 117.735 },
  { codigo_unlocode_porto: 'CNYNT', nome_porto: 'Yantai', latitude_porto: 37.464, longitude_porto: 121.448 },
  { codigo_unlocode_porto: 'CNWEI', nome_porto: 'Weihai', latitude_porto: 37.513, longitude_porto: 122.121 },
  { codigo_unlocode_porto: 'CNQDG', nome_porto: 'Qingdao', latitude_porto: 36.067, longitude_porto: 120.383 },
  { codigo_unlocode_porto: 'CNRZH', nome_porto: 'Rizhao', latitude_porto: 35.416, longitude_porto: 119.527 },
  { codigo_unlocode_porto: 'CNLYG', nome_porto: 'Lianyungang', latitude_porto: 34.596, longitude_porto: 119.221 },
  // Delta do Yangtze / leste
  { codigo_unlocode_porto: 'CNSHA', nome_porto: 'Shanghai', latitude_porto: 31.230, longitude_porto: 121.474 },
  { codigo_unlocode_porto: 'CNYGS', nome_porto: 'Yangshan', latitude_porto: 30.632, longitude_porto: 122.062 },
  { codigo_unlocode_porto: 'CNSZU', nome_porto: 'Suzhou', latitude_porto: 31.299, longitude_porto: 120.619 },
  { codigo_unlocode_porto: 'CNTAC', nome_porto: 'Taicang', latitude_porto: 31.457, longitude_porto: 121.131 },
  { codigo_unlocode_porto: 'CNNTG', nome_porto: 'Nantong', latitude_porto: 31.981, longitude_porto: 120.894 },
  { codigo_unlocode_porto: 'CNJIA', nome_porto: 'Jiangyin', latitude_porto: 31.920, longitude_porto: 120.284 },
  { codigo_unlocode_porto: 'CNNNJ', nome_porto: 'Nanjing', latitude_porto: 32.060, longitude_porto: 118.796 },
  { codigo_unlocode_porto: 'CNNBO', nome_porto: 'Ningbo-Zhoushan', latitude_porto: 29.868, longitude_porto: 121.544 },
  { codigo_unlocode_porto: 'CNWNZ', nome_porto: 'Wenzhou', latitude_porto: 28.019, longitude_porto: 120.654 },
  // Fujian
  { codigo_unlocode_porto: 'CNFUZ', nome_porto: 'Fuzhou', latitude_porto: 26.074, longitude_porto: 119.296 },
  { codigo_unlocode_porto: 'CNQZL', nome_porto: 'Quanzhou', latitude_porto: 24.874, longitude_porto: 118.675 },
  { codigo_unlocode_porto: 'CNXMN', nome_porto: 'Xiamen', latitude_porto: 24.480, longitude_porto: 118.089 },
  // Delta do Pearl River / sul
  { codigo_unlocode_porto: 'CNSWA', nome_porto: 'Shantou', latitude_porto: 23.354, longitude_porto: 116.682 },
  { codigo_unlocode_porto: 'CNSZX', nome_porto: 'Shenzhen', latitude_porto: 22.543, longitude_porto: 114.058 },
  { codigo_unlocode_porto: 'CNYTN', nome_porto: 'Yantian', latitude_porto: 22.573, longitude_porto: 114.273 },
  { codigo_unlocode_porto: 'CNSHK', nome_porto: 'Shekou', latitude_porto: 22.479, longitude_porto: 113.914 },
  { codigo_unlocode_porto: 'CNCHW', nome_porto: 'Chiwan', latitude_porto: 22.467, longitude_porto: 113.899 },
  { codigo_unlocode_porto: 'CNGZH', nome_porto: 'Guangzhou (Nansha)', latitude_porto: 23.129, longitude_porto: 113.264 },
  { codigo_unlocode_porto: 'CNZUH', nome_porto: 'Zhuhai', latitude_porto: 22.271, longitude_porto: 113.576 },
  { codigo_unlocode_porto: 'CNZHA', nome_porto: 'Zhanjiang', latitude_porto: 21.196, longitude_porto: 110.403 },
  // Hainan
  { codigo_unlocode_porto: 'CNHAK', nome_porto: 'Haikou', latitude_porto: 20.044, longitude_porto: 110.199 },
  { codigo_unlocode_porto: 'CNYPU', nome_porto: 'Yangpu', latitude_porto: 19.735, longitude_porto: 109.185 },
  { codigo_unlocode_porto: 'CNSYX', nome_porto: 'Sanya', latitude_porto: 18.252, longitude_porto: 109.512 },
  // Yangtze interior
  { codigo_unlocode_porto: 'CNJIU', nome_porto: 'Jiujiang', latitude_porto: 29.705, longitude_porto: 116.002 },
  { codigo_unlocode_porto: 'CNWUH', nome_porto: 'Wuhan', latitude_porto: 30.592, longitude_porto: 114.305 },
  { codigo_unlocode_porto: 'CNCQI', nome_porto: 'Chongqing', latitude_porto: 29.563, longitude_porto: 106.553 },
]
