---
layout: default
---


### FusionStore
FusionJS provides collection encapsulation of FsuionModels via the FusionStore module.
FusionModel uses FusionStore intenrally to store hasMany collection data but can optionally be used
if required.


#### Usage

```javascript
npm install fusionjs
```


Require it into any module.
```javascript
import {FusionStore} from 'fusionjs';
/*
* Where TestModel is a derived FusionModel class to want the collection of.
* And data is an array of objects mapped approprately to the provided model
*/
let myFusionStore = new FusionStore({
    model: TestModel,
    data: [...]
});
```

#### To update the store by appending further items into the collection
```javascript
let myFusionStore = new FusionStore({
    model: TestModel,
    data: sampleData
});
/*
* Where myAdditionalItem can be one of Object, Array or FusionModel.
* For example, for the following sample data;
 let myAdditionalItem = [{
		testRelId: 2123,
		testRelValue: 'two hundred and something odd'
	}, {
		testRelId: 2122,
		testRelValue: 'two hundred and something even'
	}]
}
*/
myFusionStore.set(myAdditionalItem);
```

#### To update the store by resetting the collection with new items
```javascript
let myFusionStore = new FusionStore({
    model: TestModel,
    data: sampleData
});
/*
* Where myAdditionalItem can be one of Object, Array or FusionModel.
* For example, for the following sample data;
 let myAdditionalItem = [{
		testRelId: 2123,
		testRelValue: 'two hundred and something odd'
	}, {
		testRelId: 2122,
		testRelValue: 'two hundred and something even'
	}]
}
*/
myFusionStore.setData(myAdditionalItem);
```
<p><a href="./" class="glyphicon-arrow-left">&#8592; back</a></p>