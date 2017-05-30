/// <reference path="../typings/globals/mocha/index.d.ts" />
import { FusionModel } from '../model/FusionModel';
import { assert } from 'assert';
import { expect } from 'chai';

describe('FusionModel', () => {

	describe('#initialise', () => {
		class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}];
		}
		let testData = { testId: 123 },
		testModel = new TestModel(testData);

		it('should configure model data when init is called', () => {
			testModel.init();
			expect(testModel.toObject()).to.deep.equal(testData);
		});
	});

	describe('#initialise with hasMany association', () => {
		class TestRelModel extends FusionModel {
			idProperty = 'relId';
			fields = [{
				name: 'relId',
				type: 'number'
			}];
			constructor(data) {
				super(data);
				this.init();
			}
		}
		class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}];
			hasMany = [{
				name: 'rels',
				model: TestRelModel
			}]
		}
		let testData = { 
			testId: 123,
			rels: [
				{relId: 123},
				{relId: 456},
				{relId: 789}
			]
		},
		testModel = new TestModel(testData);

		it('should configure model data for one-to-many association when init is called', () => {
			testModel.init();
			expect(testModel.toObject()).to.deep.equal(testData);
		});
	});

	describe('#initialise with hasOne association', () => {
		class TestRelModel extends FusionModel {
			idProperty = 'relId';
			fields = [{
				name: 'relId',
				type: 'number'
			}];
			constructor(data) {
				super(data);
				this.init();
			}
		}
		class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}];
			hasOne = [{
				name: 'rels',
				model: TestRelModel
			}]
		}
		let testData = { 
			testId: 123,
			rels: {relId: 123}
		},
		testModel = new TestModel(testData);

		it('should configure model data for one-to-one association when init is called', () => {
			testModel.init();
			expect(testModel.toObject()).to.deep.equal(testData);
		});
	});

	describe('#reset', () => {
		class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}];
		}
		let testData = { testId: 123 },
		testModel = new TestModel(testData);

		it('should reset model', () => {
			testModel.init();
			expect(testModel.toObject()).to.deep.equal(testData);
			testModel.reset();
			expect(testModel.toObject()).to.deep.equal({testId: null});
		});
	});

	describe('#reset hasMany', () => {
		class TestRelModel extends FusionModel {
			idProperty = 'relId';
			fields = [{
				name: 'relId',
				type: 'number'
			}];
			constructor(data) {
				super(data);
				this.init();
			}
		}
		class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}];
			hasMany = [{
				name: 'rels',
				model: TestRelModel
			}]
		}
		let testData = { 
			testId: 123,
			rels: [
				{relId: 123},
				{relId: 456},
				{relId: 789}
			]
		},
		testModel = new TestModel(testData);

		it('should reset model with one-to-many association', () => {
			testModel.init();
			expect(testModel.toObject()).to.deep.equal(testData);
			testModel.reset();
			expect(testModel.toObject()).to.deep.equal({testId: null, rels: []});
		});
	});

	describe('#reset hasOne', () => {
		class TestRelModel extends FusionModel {
			idProperty = 'relId';
			fields = [{
				name: 'relId',
				type: 'number'
			}];
			constructor(data) {
				super(data);
				this.init();
			}
		}
		class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}];
			hasOne = [{
				name: 'rels',
				model: TestRelModel
			}]
		}
		let testData = { 
			testId: 123,
			rels: {relId: 123}
		},
		testModel = new TestModel(testData);

		it('should reset model with one-to-one association', () => {
			testModel.init();
			expect(testModel.toObject()).to.deep.equal(testData);
			testModel.reset();
			expect(testModel.toObject()).to.deep.equal({testId: null, rels: { relId: null } });
		});
	});

	describe('#Check shallow equality', () => {
		class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}, {
				name: 'testValue',
				type: 'string'
			}];
		}
		class TestModel2 extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}];
		}
		class TestModel3 extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}, {
				name: 'testValue',
				type: 'string'
			}];
		}
		let testModel = new TestModel({ 
				testId: 123,
				testValue: 'one, two, three'
			}).init(),
			testModel2 = new TestModel2({ 
				testId: 123,
				testValue: 'three, two, one'
			}).init(),
			testModel3 = new TestModel({ 
				testId: 123,
				testValue: 'one, two, three'
			}).init();


		it('Can perform shallow equality check', () => {
			expect(testModel.equals(testModel)).to.be.true;
			expect(testModel.equals(testModel2)).to.be.false;
			expect(testModel.equals(testModel3)).to.be.true;
		});
	});

	describe('#Check shallow equality', () => {
		class TestRelOneModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}, {
				name: 'testValue',
				type: 'string'
			}];
			constructor(data) {
				super(data);
				this.init();
			}
		}
		class TestRelsModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}, {
				name: 'testValue',
				type: 'string'
			}];
			constructor(data) {
				super(data);
				this.init();
			}
		}
		class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}, {
				name: 'testValue',
				type: 'string'
			}];
			hasOne = [{
				name: 'relOne',
				model: TestRelOneModel
			}];
			hasMany = [{
				name: 'rels',
				model: TestRelsModel
			}];
		}
		class TestModel2 extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}];
			hasOne = [{
				name: 'relOne',
				model: TestRelOneModel
			}];
			hasMany = [{
				name: 'rels',
				model: TestRelsModel
			}];
		}
		class TestModel3 extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}, {
				name: 'testValue',
				type: 'string'
			}];
			hasOne = [{
				name: 'relOne',
				model: TestRelOneModel
			}];
			hasMany = [{
				name: 'rels',
				model: TestRelsModel
			}];
		}
		let testModel = new TestModel({ 
				testId: 123,
				testValue: 'one, two, three',
				relOne: {
					testId: 1123,
					testValue: 'two hundred and something'
				},
				rels: [{
					testId: 2123,
					testValue: 'two hundred and something odd'
				}, {
					testId: 2122,
					testValue: 'two hundred and something even'
				}]
			}).init(),
			testModel2 = new TestModel2({ 
				testId: 123,
				testValue: 'three, two, one',
				relOne: {
					testId: 1123,
					testValue: 'two hundred and something...'
				},
				rels: [{
					testId: 2123,
					testValue: 'two hundred and something odd...'
				}, {
					testId: 2122,
					testValue: 'two hundred and something even...'
				}]
			}).init(),
			testModel3 = new TestModel({ 
				testId: 123,
				testValue: 'one, two, three',
				relOne: {
					testId: 1123,
					testValue: 'two hundred and something'
				},
				rels: [{
					testId: 2123,
					testValue: 'two hundred and something odd'
				}, {
					testId: 2122,
					testValue: 'two hundred and something even'
				}]
			}).init();


		it('Can perform deep equality check', () => {
			expect(testModel.deepEquals(testModel)).to.be.true;
			expect(testModel.deepEquals(testModel2)).to.be.false;
			expect(testModel.deepEquals(testModel3)).to.be.true;
		});

		it('Can perform strict equality check', () => {
			expect(testModel.strictEqual(testModel)).to.be.true;
			expect(testModel.strictEqual(testModel3)).to.be.false;
		});
	});

	describe('#Can find deeply nested record', () => {
		let cnt1 = 1,
			cnt2 = 1,
			mergeTestRelOneFn = () => {
				cnt1++;
				return (cnt1 <= 10) ? {
					testId: 1123,
					testValue: 'two hundred and something',
					rels: mergeTestRelsFn()
				} : null
			},
			mergeTestRelsFn = () => {
				cnt2++;
				return (cnt2 <= 10) ? [{
					testId: 2123,
					testValue: 'two hundred and something odd',
					relOne: mergeTestRelOneFn()
				}, {
					testId: 2122,
					testValue: 'two hundred and something even'
				}] : null
			}
		class TestRelOneModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}, {
				name: 'testValue',
				type: 'string'
			}];
			constructor(data) {
				super(data);
				this.init();
			}
			hasMany = [{
				name: 'rels',
				model: TestRelsModel
			}];
		}
		class TestRelsModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}, {
				name: 'testValue',
				type: 'string'
			}];
			constructor(data) {
				super(data);
				this.init();
			}
			hasOne = [{
				name: 'relOne',
				model: TestRelOneModel
			}];
			hasMany = [{
				name: 'rels',
				model: TestRelsModel
			}];
		}
		class TestModel extends FusionModel {
			idProperty = 'testId';
			fields = [{
				name: 'testId',
				type: 'string'
			}, {
				name: 'testValue',
				type: 'string'
			}];
			hasOne = [{
				name: 'relOne',
				model: TestRelOneModel
			}];
			hasMany = [{
				name: 'rels',
				model: TestRelsModel
			}];
		}

		let testModel = new TestModel({ 
				testId: 123,
				testValue: 'one, two, three',
				relOne: mergeTestRelOneFn(),
				rels: mergeTestRelsFn()
			}).init();


		it('should return instance of record to find - #1', () => {
			let recordToFind = testModel[testModel.hasOne[0].name]()
				.rels().get()[0].relOne()
				.rels().get()[0].relOne()
				.rels().get()[0].relOne()
				.rels().get()[0].relOne()
				.rels().get()[0];
			expect(testModel.find(recordToFind)).to.be.an.equal(recordToFind);
		});

		it('should return null if record not found', () => {
				let recordToFind = {
					path: '/relOne/rels$0/relOne/rels$0/relOne/rels$40/relOne/rels$0/relOne/rels$0'
				}
				expect(testModel.find(recordToFind)).to.be.null;
		})
	});
});