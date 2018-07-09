(function (exports, node) {
  var saved_instance;

  /**
   * Connect to the server and initialize the jiff instance
   */
  exports.connect = function (hostname, computation_id, options) {
    var opt = Object.assign({}, options);
    // Added options goes here

    if (node) {
      jiff = require('../../lib/jiff-client');
    }

    saved_instance = jiff.make_jiff(hostname, computation_id, opt);
    // if you need any extensions, put them here

    return saved_instance;
  };


  function displayResult(result) { // result is a boolean
    var h = document.createElement('h6');
    var t;
    if (result) {
      t = document.createTextNode('Pictures are the same');
    } else {
      t = document.createTextNode('Pictures are different');
    }
    h.appendChild(t);
    var resultDiv = document.getElementById('result');
    resultDiv.appendChild(h);
    $('#canvas').show();
    $('#compareBtn').attr('disabled', false);
  }

  /**
   * The MPC computation
   */
  exports.compute = function (input, jiff_instance) {
    if (jiff_instance == null) {
      jiff_instance = saved_instance;
    }

    // The MPC implementation should go *HERE*
    var shares = jiff_instance.share(input); // Both parties will execute this instruction to secret share their image's hashes

    var equal = shares[1].eq(shares[2]); // Check if the hash from party 1 is equal to hash from party 2
    // Return a promise to the final output(s)
    return jiff_instance.open(equal);

    /// return jiff_instance.open(result);
  };
}((typeof exports === 'undefined' ? this.mpc = {} : exports), typeof exports !== 'undefined'));