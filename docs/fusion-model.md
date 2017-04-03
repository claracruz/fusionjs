---
layout: default
---

## Fusion Model

FusionModel is the M in MVC and provides a means to represent data that your application manages. It provides
one-to-one and one-to-many relationship capabilities

#### Usage

```javascript
npm install fusionjs
```

Then require it into any module.
```javascript
import {FusionModel} from 'fusionjs';
```


FusionModel is designed as an Abstract class and is not expected to be instantiated. To use it, extend it to create 
your model class. 
Derived classes must contain constructor functions and must call init() after super() as shown.
Fields property must be supplied.

```javascript
import {FusionModel} from 'fusionjs';
export class TestModel extends FusionModel {

	idProperty = 'testModelId';

	fields = [{
		name: 'testModelId',
		type: 'string'
	}];

	constructor(data) {
		super(data);
		this.init();
	}
}
```


#### Nested structures
To represent one-to-one and one-to-many relationships, apply hasMany and hasOne properties as shown;

```javascript
/*
For example, for the following sample data;
let sampleData = { 
	testId: 123,
	testValue: 'one, two, three',
	relOne: {
		testRelId: 1123,
		testRelValue: 'two hundred and something'
	},
	rels: [{
		testRelId: 2123,
		testRelValue: 'two hundred and something odd'
	}, {
		testRelId: 2122,
		testRelValue: 'two hundred and something even'
	}]
}
*/

import {FusionModel} from 'fusionjs';
export class TestRelModel extends FusionModel {

	idProperty = 'testRelId';

	fields = [{
		name: 'testRelId',
		type: 'string'
	}, {
		name: 'testRelValue',
		type: 'string'
	}];

	constructor(data) {
		super(data);
		this.init();
	}
}
export class TestModel extends FusionModel {

	idProperty = 'testId';

	fields = [{
		name: 'testId',
		type: 'string'
	}, {
		name: 'testValue',
		type: 'string'
	}];

	hasOne = [{
        name: 'rel',
        model: TestRelModel
    }];

	hasMany = [{
        name: 'rels',
        model: TestRelModel
    }];

	constructor(data) {
		super(data);
		this.init();
	}
}
```

#### Using your model
```javascript

let testModel = new TestModel(sampleData);
//get model data
testModel.get(); //Will return the top level data 
test.rels();	//returns a store contaning your hasMany data collection
test.rels().get(); //returns a collection (an array) of records representing your "hasMany" data
test.relOne.get() //returns a record representing your "hasOne" data

//you can set data after instantiation like so;
let testModel = new TestModel();
testModel.set(sampleData);

//you can set data to a deeply nested record like so;
testModel.rels().get()[0].set({
	testRelId: 45678,
	testRelValue: 'test'
});

//return a JS object of data in your model
testModel.toObject();

//checking equality
testModel.equals(anotherTestModel); //(Value equality checker) will return true if both models contain the same values (check does NOT include nested data)
testModel.deepEquals(anotherTestModel); //(Value equality checker) will return true if both models contain the same values (check includes nested data)
testModel.strictEquals(anotherTestModel); //(Value/Reference equality checker)  will return true if both models contain the same data (check includes nested data) and are the same instance

//To find a deeply nested record
testModel.find(myDeeplyNestedRecord);
```

<p><a href="./" class="glyphicon-arrow-left">&#8592; back</a></p>