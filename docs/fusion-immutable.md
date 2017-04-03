---
layout: default
---


### FusionImmutable
FusionJS provides immutable state management capability via its FusionImmutable module.


#### Usage

```javascript
npm install fusionjs
```


Require it into any module.
```javascript
import {FusionImmutable} from 'fusionjs';
//Where TestModel is a derived FusionModel class
let fusionImmutable = new FusionImmutable(TestModel),
	initialState = fusionImmutable.fromJS({
		id: null,
		rel: {},
		rels: []
	});
```

#### To update with state immutability, use the merge() method
```javascript
import {FusionImmutable} from 'fusionjs';
//Where TestModel is a derived FusionModel class
let fusionImmutable = new FusionImmutable(TestModel),
	state = fusionImmutable.fromJS({
		id: null,
		rel: {},
		rels: []
	});
fusionImmutable.merge(state, newData);
//Or if data is meant to update a deeply nested record within the model, then pass the record as a third argument;
fusionImmutable.merge(state, newData, record);
```
<p><a href="./" class="glyphicon-arrow-left">&#8592; back</a></p>