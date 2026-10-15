import { BehaviorType } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
import { Category } from "@normalized:N&&&entry/src/main/ets/common/model/Models&";
export const BEHAVIORS: Array<BehaviorType> = [
    // ============ 绿色出行（以每公里相对自驾燃油小客车的减排量计，约 0.19 kgCO2/km）============
    new BehaviorType('walk', '步行出行', Category.TRAVEL, '公里', 0.19, '🚶', '今日步行替代开车的公里数', 1, 1),
    new BehaviorType('bike', '骑行出行', Category.TRAVEL, '公里', 0.19, '🚴', '今日骑行共享单车/自行车的公里数', 1, 1),
    new BehaviorType('bus', '公交出行', Category.TRAVEL, '公里', 0.10, '🚌', '乘坐公共汽车的公里数', 5, 1),
    new BehaviorType('metro', '地铁出行', Category.TRAVEL, '公里', 0.12, '🚇', '乘坐地铁/轨道交通的公里数', 5, 1),
    new BehaviorType('evcar', '新能源汽车', Category.TRAVEL, '公里', 0.10, '🔋', '驾驶新能源汽车替代燃油车的公里数', 10, 1),
    new BehaviorType('carpool', '拼车合乘', Category.TRAVEL, '公里', 0.10, '🚗', '与他人拼车合乘分摊的里程', 10, 1),
    // ============ 节水节电 ============
    new BehaviorType('elec', '节约用电', Category.ENERGY, '度', 0.785, '⚡', '相比平时节约的电量（kWh）', 1, 1),
    new BehaviorType('water', '节约用水', Category.ENERGY, '升', 0.0009, '💧', '相比平时节约的水量（升）', 50, 10),
    new BehaviorType('gas', '节约燃气', Category.ENERGY, '立方米', 2.1, '🔥', '节约的天然气用量（m³）', 1, 1),
    new BehaviorType('paper', '节约用纸', Category.ENERGY, '张', 0.015, '📄', '双面打印、无纸化所节约的纸张', 20, 10),
    new BehaviorType('ac26', '空调26℃', Category.ENERGY, '次', 0.5, '🌡️', '夏季空调设置不低于26℃的次数', 1, 1),
    new BehaviorType('unplug', '随手断电', Category.ENERGY, '次', 0.3, '🔌', '关闭电器、拔掉插头减少待机耗电', 1, 1),
    // ============ 旧物回收（每千克回收物对应减排量）============
    new BehaviorType('paper_waste', '废纸回收', Category.RECYCLE, '千克', 1.3, '📰', '回收报纸、纸箱、书本等废纸重量', 1, 1),
    new BehaviorType('plastic', '塑料回收', Category.RECYCLE, '千克', 2.7, '🧴', '回收塑料瓶、塑料包装等重量', 1, 1),
    new BehaviorType('metal', '金属回收', Category.RECYCLE, '千克', 8.0, '🥫', '回收易拉罐、金属罐等重量', 1, 1),
    new BehaviorType('glass', '玻璃回收', Category.RECYCLE, '千克', 0.85, '🍾', '回收玻璃瓶、玻璃制品重量', 1, 1),
    new BehaviorType('clothes', '旧衣回收', Category.RECYCLE, '千克', 6.0, '👕', '捐赠或回收的旧衣物重量', 1, 1),
    new BehaviorType('ewaste', '电子废弃物', Category.RECYCLE, '千克', 5.0, '📱', '规范回收的废旧电子产品重量', 1, 1),
    new BehaviorType('donate', '旧物捐赠', Category.RECYCLE, '件', 3.5, '🎁', '捐赠图书、玩具、家电等可复用物品', 1, 1),
    new BehaviorType('secondhand', '二手转卖', Category.RECYCLE, '件', 4.0, '🔄', '通过二手平台转卖流转的旧物', 1, 1),
    // ============ 光盘行动 / 绿色消费 ============
    new BehaviorType('clearplate', '光盘行动', Category.FOOD, '餐', 0.8, '🍽️', '按需点餐、吃完不剩的餐次', 1, 1),
    new BehaviorType('veggie', '素食一餐', Category.FOOD, '次', 1.5, '🥗', '以素食替代红肉的一餐', 1, 1),
    new BehaviorType('lunchbox', '自带餐盒', Category.FOOD, '次', 0.15, '🥡', '自带餐盒打包、避免一次性餐盒', 1, 1),
    new BehaviorType('bag', '自带购物袋', Category.FOOD, '次', 0.05, '🛍️', '购物自带环保袋、拒绝塑料袋', 1, 1),
    new BehaviorType('cup', '自带水杯', Category.FOOD, '次', 0.1, '🥤', '自带水杯、不购买瓶装水', 1, 1),
    new BehaviorType('nochopsticks', '拒一次性餐具', Category.FOOD, '次', 0.08, '🥢', '外卖不索要一次性餐具', 1, 1),
    new BehaviorType('classify', '垃圾分类', Category.FOOD, '次', 0.2, '🗑️', '按要求正确分类投放垃圾', 1, 1)
];
/** 按分类获取行为类型 */
export function getBehaviorsByCategory(category: string): Array<BehaviorType> {
    const list: Array<BehaviorType> = [];
    for (let i = 0; i < BEHAVIORS.length; i++) {
        if (BEHAVIORS[i].category === category) {
            list.push(BEHAVIORS[i]);
        }
    }
    return list;
}
/** 按 id 获取行为类型 */
export function getBehaviorById(id: string): BehaviorType {
    for (let i = 0; i < BEHAVIORS.length; i++) {
        if (BEHAVIORS[i].id === id) {
            return BEHAVIORS[i];
        }
    }
    return BEHAVIORS[0];
}
