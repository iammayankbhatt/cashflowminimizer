export default function minimize(transactions) {
    const people = new Set();
    transactions.forEach(t => {
      people.add(t.from);
      people.add(t.to);
    });
  
    const N = people.size;
    const nameToIndex = {};
    const indexToName = {};
    let idx = 0;
    people.forEach(name => {
      nameToIndex[name] = idx;
      indexToName[idx] = name;
      idx++;
    });
  
    const net = Array(N).fill(0);
    transactions.forEach(({ from, to, amount }) => {
      net[nameToIndex[from]] -= amount;
      net[nameToIndex[to]] += amount;
    });
  
    const result = [];
  
    function getMaxCredit() {
      let max = 0;
      for (let i = 1; i < N; i++)
        if (net[i] > net[max]) max = i;
      return net[max] > 0 ? max : -1;
    }
  
    function getMaxDebit() {
      let min = 0;
      for (let i = 1; i < N; i++)
        if (net[i] < net[min]) min = i;
      return net[min] < 0 ? min : -1;
    }
  
    while (true) {
      const debtor = getMaxDebit();
      const creditor = getMaxCredit();
      if (debtor === -1 || creditor === -1) break;
  
      const minAmt = Math.min(-net[debtor], net[creditor]);
      net[debtor] += minAmt;
      net[creditor] -= minAmt;
  
      result.push({
        from: indexToName[debtor],
        to: indexToName[creditor],
        amount: minAmt
      });
    }
  
    return result;
  }
  