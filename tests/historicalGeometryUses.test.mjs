import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sortHistoricalGeometryUses, historicalUsesForGeometry, formatHistoricalDate,
  formatHistoricalUse, validateHistoricalGeometryRegister
} from '../src/data/historicalGeometryUses.mjs';

// In production, these labels come from App.WORDS[lang] for every module.
const labels = {
  ro: {
    referenceDatePrefix: 'An de referință: ',
    undatedPeriod: 'Perioadă nedeterminată',
    untilPrefix: 'Până la ', fromPrefix: 'De la '
  },
  en: {
    referenceDatePrefix: 'Reference date: ',
    undatedPeriod: 'Undated period',
    untilPrefix: 'Until ', fromPrefix: 'From '
  }
};

const use = (useId, entityId, kind, temporal, geometryId='g001') => ({
  useId, entityId, geometryId, kind, entityName: { ro: entityId },
  evidenceStatus: 'qualified', sourceIds: ['OHM'],
  ...temporal
});

test('a single outline has multiple historically distinct uses sorted chronologically', () => {
  const snapshot = use('u-1910','Austria-Hungary','reference',{at:{year:1910}});
  const old = use('u-1600','Wallachia','interval',{from:{year:1600},to:{year:1602}});
  const newer = use('u-1859','United Principalities','interval',{from:{year:1859},to:{year:1862}});
  const undated = use('u-unknown','Wallachia','interval',{});
  const unrelated = use('u-other','Moldavia','reference',{at:{year:1910}},'g002');
  const input = [snapshot,undated,unrelated,newer,old];
  const output = historicalUsesForGeometry(input,'g001');
  assert.deepEqual(output.map(x=>x.useId),['u-1600','u-1859','u-1910','u-unknown']);
  assert.deepEqual(input.map(x=>x.useId),['u-1910','u-unknown','u-other','u-1859','u-1600']);
  assert.deepEqual(validateHistoricalGeometryRegister(
    [{geometryId:'g001',canonicalHash:'h1'},{geometryId:'g002',canonicalHash:'h2'}],input
  ), {geometryCount:2,usageCount:5});
});

test('reference year is a snapshot, never a fabricated historical interval', () => {
  const snapshot = use('u-1910','Austria-Hungary','reference',{at:{year:1910}});
  assert.equal(formatHistoricalUse(snapshot,'ro',labels.ro),'An de referință: 1910');
  assert.equal(formatHistoricalUse(snapshot,'en',labels.en),'Reference date: 1910');
});

test('date precision, BCE and qualifiers survive presentation', () => {
  assert.equal(formatHistoricalDate({year:1918,month:12,day:1},'ro'),'1 decembrie 1918');
  assert.equal(formatHistoricalDate({year:1918,month:12,day:1},'en'),'December 1, 1918');
  assert.equal(formatHistoricalDate({year:-106},'ro'),'106 î.Hr.');
  assert.equal(formatHistoricalDate({year:-106,qualifier:'circa'},'en'),'c. 106 BCE');
  assert.deepEqual(sortHistoricalGeometryUses([
    use('positive','A','reference',{at:{year:1910}}),
    use('negative','B','reference',{at:{year:-106}})
  ]).map(x=>x.useId),['negative','positive']);
});

test('open-ended and undated ranges are explicit, never filled by guesses', () => {
  assert.equal(formatHistoricalUse(use('a','A','interval',{from:{year:1859}}),'ro',labels.ro),'De la 1859');
  assert.equal(formatHistoricalUse(use('b','A','interval',{to:{year:1862}}),'en',labels.en),'Until 1862');
  assert.equal(formatHistoricalUse(use('c','A','interval',{}),'ro',labels.ro),'Perioadă nedeterminată');
});

test('rejects duplicate physical geometries, IDs and dangling temporal uses', () => {
  const record={geometryId:'g001',canonicalHash:'same'};
  const a=use('u1','A','reference',{at:{year:1910}});
  assert.throws(()=>validateHistoricalGeometryRegister([record,{geometryId:'g002',canonicalHash:'same'}],[a]),
    /fingerprint is stored more than once/);
  assert.throws(()=>validateHistoricalGeometryRegister([record,record],[a]),/Duplicate geometry ID/);
  assert.throws(()=>validateHistoricalGeometryRegister([record],[a,a]),/Duplicate temporal use/);
  assert.throws(()=>validateHistoricalGeometryRegister([record],[{...a,geometryId:'missing'}]),/Unknown geometry/);
});

test('rejects chronologically inconsistent and malformed temporal records', () => {
  assert.throws(()=>sortHistoricalGeometryUses([
    use('bad','A','interval',{from:{year:1862},to:{year:1859}})
  ]), /end precedes start/);
  assert.throws(()=>sortHistoricalGeometryUses([
    use('bad','A','reference',{at:{year:1910},to:{year:1918}})
  ]), /must have at and no interval/);
  assert.throws(()=>formatHistoricalDate({year:0}),/nonzero integer year/);
});

test('global translation copy is required for periods, never locally duplicated', () => {
  const snapshot = use('u-1910','Austria-Hungary','reference',{at:{year:1910}});
  assert.throws(() => formatHistoricalUse(snapshot,'ro'), /Global geometry-use translation labels required/);
  assert.equal(formatHistoricalUse(snapshot,'ro',{...labels.ro,referenceDatePrefix:'Dată documentată: '}),
    'Dată documentată: 1910');
});
