import {DataField} from '../index';

describe('non wrapping data', () => {
  let data: number[][] = [[]];
  beforeEach(() => {
    data = [];
    for (let x = 0; x < 11; x++) {
      data.push([]);
      for (let y = 0; y < 11; y++) {
        data[x].push(x * y);
      }
    }
  });

  const getDataField = () => new DataField(data, -5, 5, 175, 185, 1);

  test('lonwrap', () => {
    expect(getDataField().lonWrap()).toBe(false);
  });

  test('minLon', () => {
    expect(getDataField().getMinLon()).toEqual(175);
  });

  test('maxLon', () => {
    expect(getDataField().getMaxLon()).toEqual(185);
  });
  test('minLat', () => {
    expect(getDataField().getMinLat()).toEqual(-5);
  });

  test('maxLat', () => {
    expect(getDataField().getMaxLat()).toEqual(5);
  });

  test('getVal out of bounds', () => {
    expect(() => {
      getDataField().getValue(-6, 175);
    }).toThrow();
  });

  test('getVal1', () => {
    expect(getDataField().getValue(5, 185)).toEqual(100);
  });

  test('getVal2', () => {
    expect(getDataField().getValue(2.5, 185)).toEqual(75);
  });
});

describe('wrapping data', () => {
  let data: number[][] = [[]];
  beforeEach(() => {
    data = [];
    for (let x = 0; x < 360; x++) {
      data.push([]);
      for (let y = 0; y < 181; y++) {
        data[x].push(x * y);
      }
    }
  });

  const getDataField = () => new DataField(data, -90, 90, 0, 359, 1);

  test('lonwrap', () => {
    expect(getDataField().lonWrap()).toBe(true);
  });

  test('minLon', () => {
    expect(getDataField().getMinLon()).toEqual(0);
  });

  test('maxLon', () => {
    expect(getDataField().getMaxLon()).toEqual(360);
  });

  test('minLat', () => {
    expect(getDataField().getMinLat()).toEqual(-90);
  });

  test('maxLat', () => {
    expect(getDataField().getMaxLat()).toEqual(90);
  });

  test('getVal1', () => {
    expect(getDataField().getValue(-5, 0)).toEqual(0);
  });

  test('getVal2', () => {
    expect(getDataField().getValue(0, 1)).toEqual(90);
  });

  test('getVal3', () => {
    expect(getDataField().getValue(0, 360)).toEqual(0);
  });

  test('getVal4', () => {
    expect(getDataField().getValue(0, 358.5)).toEqual(90 * 358.5);
  });

  test('getVal5', () => {
    expect(getDataField().getValue(0, 359.5)).toEqual(90 * 359 * 0.5);
  });

  test('getVal3', () => {
    expect(getDataField().getValue(0, 359)).toEqual(90 * 359);
  });
});
