pragma circom 2.0.0;


template LessThan(n) {
    //渡されたbit数が252以上なら終了する
    assert(n <= 252);
    // 比較対象の二つの値をin[0]とin[1]に入れる
    signal input in[2];
    signal output out;
// Num2Bitsのインスタンス化
    component n2b = Num2Bits(n+1);

    n2b.in <== in[0]+ (1<<n) - in[1];

    out <== 1-n2b.out[n];
}

component main = LessThan(252);