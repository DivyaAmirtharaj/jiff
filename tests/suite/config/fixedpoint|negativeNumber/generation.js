// BigNumber Library
var BigNumber = require('bignumber.js');
BigNumber.config({ DECIMAL_PLACES: 131 });

// functions specific to fixedpoint
var isConstant;
function determineMax(test, party_count, integer_digits, decimal_digits) {
  var max = new BigNumber(10).pow(integer_digits + decimal_digits);
  var operation_count = isConstant ? 2 : party_count;

  // +: max + max ... + max = party_count * max <= 10^(digits)
  if (test === '+' || test === '-') {
    max = max.div(operation_count).floor();
  }

  // *: max * max * ... * max = max^(party_count) <= 10^(digits)
  // => max <= 10^(digits)^(1/party_count) = 10^(digits/party_count)
  // Note that for constant *, we only perform a single multiplication in the test
  if (test === '*' || test === '*bgw') {
    var pow = Math.floor((integer_digits + decimal_digits) / operation_count);
    max = new BigNumber(10).pow(pow);
  }

  return max;
}

// helpers: organized like this to make it easy for extension generation to override functionality.
var _helpers = {};
_helpers.generateUniform = function (test, options) {
  var max = determineMax(test, options.party_count, options.integer_digits, options.decimal_digits);
  var wholeNum = BigNumber.random().times(max).floor();
  var deciNum = wholeNum.div(new BigNumber(10).pow(options.decimal_digits));
  return Math.random() < 0.5 ? deciNum : deciNum.times(-1);
};
_helpers.generateNonZeroUniform = function (test, options) {
  var max = determineMax(test, options.party_count, options.integer_digits, options.decimal_digits);
  var wholeNum = BigNumber.random().times(max.minus(1)).plus(1).floor();
  var deciNum = wholeNum.div(new BigNumber(10).pow(options.decimal_digits));
  return Math.random() < 0.5 ? deciNum : deciNum.times(-1);
};
_helpers.generateBit = function (test, options) {
  return Math.random() < 0.5 ? new BigNumber(0) : new BigNumber(1);
};

// Reuse base generation but with different helpers
var baseGeneration = require('../base/generation.js');

exports.generateArithmeticInputs = function (test, count, options) {
  isConstant = false;
  return baseGeneration.generateArithmeticInputs(test, count, options, _helpers);
};

exports.generateConstantArithmeticInputs = function (test, count, options) {
  isConstant = true;
  return baseGeneration.generateConstantArithmeticInputs(test, count, options, _helpers);
};

exports.generateComparisonInputs = function (test, count, options) {
  isConstant = false;
  return baseGeneration.generateComparisonInputs(test, count, options, _helpers);
};

exports.generateConstantComparisonInputs = function (test, count, options) {
  isConstant = true;
  return baseGeneration.generateConstantComparisonInputs(test, count, options, _helpers);
};