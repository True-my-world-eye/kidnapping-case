/**
 * employeeConstants.ts — GAStech 员工分类常量。
 *
 * 数据源：employee_nodes.csv（VAST Challenge 2021 MC1），54 名员工档案。
 * 注意：ghosts 名单是研究者推断，employee_nodes.csv 中无对应字段。
 *
 * 原定义分散在 Slide5Network.tsx 和 Slide6Collapse.tsx 中，现集中管理。
 */

/** 核心高管层 (Layer 1) — is_executive = yes */
export const EXECUTIVES_L1 = [
  'Sten Sanjorge Jr.', 'Sten_Sanjorge',
  'Ingrid Barranco', 'Ingrid_Barranco',
  'Ada Campo-Corrente', 'Ada_Campo_Corrente',
  'Orhan Strum', 'Orhan_Strum',
  'Willem Vasco-Pais', 'Willem_Vasco_Pais',
];

/** 部门经理层 (Layer 2) — is_manager = yes */
export const MANAGERS_L2 = [
  'Lidelse Dedos', 'Lidelse_Dedos',
  'Bertrand Ovan', 'Bertrand_Ovan',
  'Linnea Bergen', 'Linnea_Bergen',
  'Felix Resumir', 'Felix_Resumir',
];

/** 家族姓氏聚类 — 用于识别潜在裙带关系 */
export const FAMILY_NAMES = ['Bodrogi', 'Vann', 'Osvaldo', 'Lagos', 'Ferro'];

/** 核心内鬼（高置信度）— 与 POK 存在跨组织联系的员工 */
export const CORE_MOLES = [
  'Isia Vann', 'Loreto Bodrogi', 'Edvard Vann', 'Varja Lagos',
  'Isia_Vann', 'Loreto_Bodrogi', 'Edvard_Vann', 'Varja_Lagos',
];

/** 所有潜在外联人员 — coreMoles 的超集，含 POK 相关联系人 */
export const ALL_MOLES = [
  ...CORE_MOLES,
  // 额外纳入下划线变体作为兼容
];

/**
 * 幽灵员工名单（19 人）— 研究者推断的"无简历"人员。
 *
 * 重要局限：
 * - employee_nodes.csv 中无 "resume_status" 或 "is_ghost" 字段。
 * - 此名单基于姓氏聚类、入职时间和部门分布的人工推断。
 * - 54 名员工在 CSV 中均拥有完整的出生日期、国籍、入职日期等字段。
 * - 该分类不是数据的直接映射，建议在正式报告中标注为"研究者推断"。
 */
export const GHOST_EMPLOYEES = [
  'Isia Vann', 'Edvard Vann', 'Loreto Bodrogi', 'Henk Mies', 'Minke Mies',
  'Adan Morlun', 'Valeria Morlun', 'Cecilia Morluniau', 'Benito Hawelon', 'Claudio Hawelon',
  'Varja Lagos', 'Albina Hafon', 'Irene Nant', 'Dylan Scozzese', 'Kanon Herrero',
  'Stenig Fusil', 'Hennie Osvaldo', 'Hideki Cocinaro', 'Inga Ferro',
  // 下划线变体（兼容 network_nodes.csv 的 node_id 格式）
  'Isia_Vann', 'Edvard_Vann', 'Loreto_Bodrogi', 'Henk_Mies', 'Minke_Mies',
  'Adan_Morlun', 'Valeria_Morlun', 'Cecilia_Morluniau', 'Benito_Hawelon', 'Claudio_Hawelon',
  'Varja_Lagos', 'Albina_Hafon', 'Irene_Nant', 'Dylan_Scozzese', 'Kanon_Herrero',
  'Stenig_Fusil', 'Hennie_Osvaldo', 'Hideki_Cocinaro', 'Inga_Ferro',
];
