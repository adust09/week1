pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals

template Multiplier3 () {  
   // a*b*cの解を知っていることを証明する

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal output ab;
   signal output d;  

   // Constraints.  
   ab <== a * b;
   d <== ab * c;  
}

component main = Multiplier3();