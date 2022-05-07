pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
template RangeProof(m,n) {
    assert(n <= 252);

<<<<<<< HEAD
    signal input in; // this is the number to be proved inside the range
=======
    // rangeの中にinが存在することを証明する
    // range[1]=< in =< range[2]
    //sudokuで使えるようにするには、in[9][9]とする必要がある
    // signal input in; // this is the number to be proved inside the range
    signal input in[m][n]; //sudoku仕様に変更 
>>>>>>> 2a4f450f33edd647dc597d3c040afb41d9ece7c2
    signal input range[2]; // the two elements should be the range, i.e. [lower bound, upper bound]
    signal output out;

    signal temp[m*n];
    temp[0] <== in[0][0];
    var idx = 0;

    component low = LessEqThan(n);
    component high = GreaterEqThan(n);

    // [assignment] insert your code here
<<<<<<< HEAD
	
    low.in[0] <== range[1];
    low.in[1] <== in;

    high.in[0] <== in;
    high.in[1] <== range[2];

    out <== low.out && high.out;
=======


    for (var i = 0; i < m; i++) {
        for (var j = 0; j < n; j++) {
            if (idx > 0){
            temp[idx] <== in[i][j];
            }
            idx++;
        }
    }
    low.in[0] <== range[0];
    low.in[1] <== temp[m*n-1];
    
    high.in[1] <== range[1];
    high.in[0] <== temp[m*n-1];
    
    out <-- low.out && high.out;
>>>>>>> 2a4f450f33edd647dc597d3c040afb41d9ece7c2
}