import test from 'node:test';
import assert from 'node:assert/strict';
import { processFoodsScore, processFoodNutrients } from '../src/utils/food-woker.js';
import { mapDetectedFoods } from '../src/utils/food-utils.js';
test('recommendation charts and image matches retain actual signed backend scores',()=>{
 const source={Apple:-2.5,Spinach:8.25,Unknown:null};
 const rows=processFoodsScore(source,[{name:'Apple',category:'fruit'},{name:'Spinach',category:'vegetable'}]);
 assert.deepEqual(rows.map(row=>[row.name,row.value,row.rank]),[['Spinach',8.25,1],['Apple',-2.5,2]]);
 assert.equal(mapDetectedFoods(['apple','spinach'],rows,'value').maxFood,'Spinach');
 assert.equal(mapDetectedFoods(['apple'],rows,'value').mappedPredictedFoods[0].score,-2.5);
 assert.equal(source.Apple,-2.5);
});
test('composition keeps supplied units and amounts in both directions',()=>{
 const data=processFoodNutrients([{food:{name:'Apple',category:'fruit',subcategory:'Pome',nutriscore:.8},nutrient:{name:'Vitamin C',nutrient_category:'Vitamins',unit:'mg'},value:4.6}]);
 assert.equal(data.foodNutrients[0].Apple.associations['Vitamin C'].unit,'mg');
 assert.equal(data.nutrientsFoods[0]['Vitamin C'].unit,'mg');
 assert.equal(data.nutrientsFoods[0]['Vitamin C'].associations.Apple.value,4.6);
});
