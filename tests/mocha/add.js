var jiff = require ("../../lib/jiff-client.js");

var tests = [
    [674, 474, 663], [408, 291, 38], [640, 108, 764],
    [129, 238, 182], [494, 1005, 325], [163, 929, 554],
    [541, 61, 818], [269, 153, 405], [152, 172, 37],
    [600, 345, 993], [10, 871, 712], [640, 409, 487],
    [674, 129, 689], [1004, 286, 995], [970, 533, 714],
    [296, 953, 464], [146, 877, 406], [378, 241, 290],
    [736, 641, 938], [312, 558, 681], [687, 999, 759],
    [1016, 1011, 831], [1006, 743, 603], [710, 824, 673],
    [858, 518, 500], [150, 756, 117], [603, 371, 8],
    [89, 923, 448], [415, 535, 105], [876, 445, 589],
    [354, 729, 774], [883, 1029, 361], [235, 703, 222],
    [941, 566, 651], [375, 806, 662], [997, 827, 941],
    [253, 596, 997], [886, 96, 554], [417, 929, 813],
    [230, 716, 256], [499, 936, 761], [452, 74, 168],
    [525, 679, 331], [116, 491, 719], [963, 933, 67],
    [897, 246, 478], [1019, 502, 245], [154, 78, 717],
    [711, 497, 717], [983, 112, 38]
  ];

var jiff_instances = null;
var parties = tests[0].length;
var has_failed = false;

function run_test(computation_id, callback) {
  computation_id = computation_id + "";
  
  var counter = 0;
  options = { party_count: parties };
  options.onConnect = function() { counter++; if(counter == 3) test(callback); };

  var jiff_instance1 = jiff.make_jiff("http://localhost:3000", computation_id, options);
  var jiff_instance2 = jiff.make_jiff("http://localhost:3000", computation_id, options);
  var jiff_instance3 = jiff.make_jiff("http://localhost:3000", computation_id, options);
  jiff_instances = [jiff_instance1, jiff_instance2, jiff_instance3];
}

// run all tests
function test(callback) {
  if(jiff_instances[0] == null || !jiff_instances[0].ready) { alert("Please wait!"); return; }
  has_failed = false;

  var promises = []
  for(var i = 0; i < tests.length; i++) {
    for (var j = 0; j < jiff_instances.length; j++) {
      var promise = single_test(i, jiff_instances[j]);
      promises.push(promise);
    }
  }

  Promise.all(promises).then(function() {
    callback(!has_failed);
  });
}

// run test case at index
function single_test(index, jiff_instance) {
  var numbers = tests[index];
  var party_index = jiff_instance.id - 1;
  var shares = jiff_instance.share(numbers[party_index]);

  var sum = shares[1];
  for(var i = 2; i <= parties; i++) {
    sum = sum.add(shares[i]);
  }
  var deferred = $.Deferred();
  sum.open(function(result) { test_output(index, result); deferred.resolve(); }, error);
  return deferred.promise();
}

// determine if the output is correct
function test_output(index, result) {
  var numbers = tests[index];
  var sum = 0;
  for(var i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }

  sum = jiff.mod(sum, Zp);
  if(sum != result) { // sum is incorrect
    has_failed = true;
    console.log(numbers.join(" + ") + " != " + result);
  }
}

// register communication error
function error() {
  has_failed = true;
  console.log("Communication error");
}

module.exports = {
  run_test: run_test
};
