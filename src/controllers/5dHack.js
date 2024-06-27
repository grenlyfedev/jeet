function generateMockData() {
  const mockData = [];

  for (let i = 0; i < 30; i++) {
    const id_product = "product_" + i;
    const phone = "phone_" + i;
    const code = "code_" + i;
    const invite = "invite_" + i;
    const stage = Math.floor(Math.random() * 5) + 1; // Random stage between 1 and 5
    const result = "result_" + i;
    const level = Math.floor(Math.random() * 100); // Random level between 0 and 99
    const money = Math.floor(Math.random() * 1000); // Random money between 0 and 999
    const price = Math.floor(Math.random() * 1000); // Random price between 0 and 999
    const amount = Math.floor(Math.random() * 1000); // Random amount between 0 and 999
    const fee = Math.floor(Math.random() * 100); // Random fee between 0 and 99
    const get = Math.floor(Math.random() * 1000); // Random get between 0 and 999
    const game = Math.floor(Math.random() * 100); // Random game between 0 and 99
    const join_bet =
      Math.random() < 0.5
        ? "a"
        : Math.random() < 0.5
        ? "b"
        : Math.random() < 0.5
        ? "c"
        : Math.random() < 0.5
        ? "d"
        : "e"; // Random join_bet among a, b, c, d, e
    const bet =
      Math.random() < 0.5 ? Math.floor(Math.random() * 100) : "not_a_number"; // Random bet, sometimes it's a number, sometimes it's not
    const status = Math.floor(Math.random() * 2); // Random status either 0 or 1
    const time = "time_" + i;

    mockData.push({
      id_product,
      phone,
      code,
      invite,
      stage,
      result,
      level,
      money,
      price,
      amount,
      fee,
      get,
      game,
      join_bet,
      bet,
      status,
      time,
    });
  }

  return mockData;
}

const mockDataArray = generateMockData();

function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

const validBetValue = [
  "l",
  "b",
  "c",
  "s",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];
const validBetType = ["a", "b", "c", "d", "e", "total"];

var resultArray = [];

export function calculateMoney5d(mockDataArray) {
  var a0 = 0;
  var a1 = 0;
  var a2 = 0;
  var a3 = 0;
  var a4 = 0;
  var a5 = 0;
  var a6 = 0;
  var a7 = 0;
  var a8 = 0;
  var a9 = 0;
  var al = 0;
  var as = 0;
  var ab = 0;
  var ac = 0;
  var b0 = 0;
  var b1 = 0;
  var b2 = 0;
  var b3 = 0;
  var b4 = 0;
  var b5 = 0;
  var b6 = 0;
  var b7 = 0;
  var b8 = 0;
  var b9 = 0;
  var bl = 0;
  var bs = 0;
  var bb = 0;
  var bc = 0;
  var c0 = 0;
  var c1 = 0;
  var c2 = 0;
  var c3 = 0;
  var c4 = 0;
  var c5 = 0;
  var c6 = 0;
  var c7 = 0;
  var c8 = 0;
  var c9 = 0;
  var cl = 0;
  var cs = 0;
  var cb = 0;
  var cc = 0;
  var d0 = 0;
  var d1 = 0;
  var d2 = 0;
  var d3 = 0;
  var d4 = 0;
  var d5 = 0;
  var d6 = 0;
  var d7 = 0;
  var d8 = 0;
  var d9 = 0;
  var dl = 0;
  var ds = 0;
  var db = 0;
  var dc = 0;
  var e0 = 0;
  var e1 = 0;
  var e2 = 0;
  var e3 = 0;
  var e4 = 0;
  var e5 = 0;
  var e6 = 0;
  var e7 = 0;
  var e8 = 0;
  var e9 = 0;
  var el = 0;
  var es = 0;
  var eb = 0;
  var ec = 0;

  mockDataArray.map((item) => {
    switch (item.join_bet) {
      case "a":
        switch (item.bet) {
          case "0":
            a0 += item.money * 9;
            break;
          case "1":
            a1 += item.money * 9;
            break;
          case "2":
            a2 += item.money * 9;
            break;
          case "3":
            a3 += item.money * 9;
            break;
          case "4":
            a4 += item.money * 9;
            break;
          case "5":
            a5 += item.money * 9;
            break;
          case "6":
            a6 += item.money * 9;
            break;
          case "7":
            a7 += item.money * 9;
            break;
          case "8":
            a8 += item.money * 9;
            break;
          case "9":
            a9 += item.money * 9;
            break;
          case "l":
            al += item.money * 2;
            break;
          case "c":
            ac += item.money * 2;
            break;
          case "b":
            ab += item.money * 2;
            break;
          case "s":
            as += item.money * 2;
            break;
        }
        break;
      case "b":
        switch (item.bet) {
          case "0":
            b0 += item.money * 9;
            break;
          case "1":
            b1 += item.money * 9;
            break;
          case "2":
            b2 += item.money * 9;
            break;
          case "3":
            b3 += item.money * 9;
            break;
          case "4":
            b4 += item.money * 9;
            break;
          case "5":
            b5 += item.money * 9;
            break;
          case "6":
            b6 += item.money * 9;
            break;
          case "7":
            b7 += item.money * 9;
            break;
          case "8":
            b8 += item.money * 9;
            break;
          case "9":
            b9 += item.money * 9;
            break;
          case "l":
            bl += item.money * 2;
            break;
          case "c":
            bc += item.money * 2;
            break;
          case "b":
            bb += item.money * 2;
            break;
          case "s":
            bs += item.money * 2;
            break;
        }
        break;
      case "c":
        switch (item.bet) {
          case "0":
            c0 += item.money * 9;
            break;
          case "1":
            c1 += item.money * 9;
            break;
          case "2":
            c2 += item.money * 9;
            break;
          case "3":
            c3 += item.money * 9;
            break;
          case "4":
            c4 += item.money * 9;
            break;
          case "5":
            c5 += item.money * 9;
            break;
          case "6":
            c6 += item.money * 9;
            break;
          case "7":
            c7 += item.money * 9;
            break;
          case "8":
            c8 += item.money * 9;
            break;
          case "9":
            c9 += item.money * 9;
            break;
          case "l":
            cl += item.money * 2;
            break;
          case "c":
            cc += item.money * 2;
            break;
          case "b":
            cb += item.money * 2;
            break;
          case "s":
            cs += item.money * 2;
            break;
        }
        break;
      case "d":
        switch (item.bet) {
          case "0":
            d0 += item.money * 9;
            break;
          case "1":
            d1 += item.money * 9;
            break;
          case "2":
            d2 += item.money * 9;
            break;
          case "3":
            d3 += item.money * 9;
            break;
          case "4":
            d4 += item.money * 9;
            break;
          case "5":
            d5 += item.money * 9;
            break;
          case "6":
            d6 += item.money * 9;
            break;
          case "7":
            d7 += item.money * 9;
            break;
          case "8":
            d8 += item.money * 9;
            break;
          case "9":
            d9 += item.money * 9;
            break;
          case "l":
            dl += item.money * 2;
            break;
          case "c":
            dc += item.money * 2;
            break;
          case "b":
            db += item.money * 2;
            break;
          case "s":
            ds += item.money * 2;
            break;
        }
        break;

      case "e":
        switch (item.bet) {
          case "0":
            e0 += item.money * 9;
            break;
          case "1":
            e1 += item.money * 9;
            break;
          case "2":
            e2 += item.money * 9;
            break;
          case "3":
            e3 += item.money * 9;
            break;
          case "4":
            e4 += item.money * 9;
            break;
          case "5":
            e5 += item.money * 9;
            break;
          case "6":
            e6 += item.money * 9;
            break;
          case "7":
            e7 += item.money * 9;
            break;
          case "8":
            e8 += item.money * 9;
            break;
          case "9":
            e9 += item.money * 9;
            break;
          case "l":
            el += item.money * 2;
            break;
          case "c":
            ec += item.money * 2;
            break;
          case "b":
            eb += item.money * 2;
            break;
          case "s":
            es += item.money * 2;
            break;
        }
        break;
    }
  });

  const arraya = [];
  const arrayb = [];
  const arrayc = [];
  const arrayd = [];
  const arraye = [];

  for (let i = 0; i <= 9; i++) {
    const obja = {};
    obja["a" + i] = eval("a" + i);
    arraya.push(obja);

    const objb = {};
    objb["b" + i] = eval("b" + i);
    arrayb.push(objb);

    const objc = {};
    objc["c" + i] = eval("c" + i);
    arrayc.push(objc);

    const objd = {};
    objd["d" + i] = eval("d" + i);
    arrayd.push(objd);

    const obje = {};
    obje["e" + i] = eval("e" + i);
    arraye.push(obje);
  }
  const newArray = [arraya, arrayb, arrayc, arrayd, arraye];
  // const obja = {};
  // obja["l"] = al;
  // arraya.push(obja);

  // const objb = {};
  // objb["l"] = bl;
  // arrayb.push(objb);

  // const objc = {};
  // objc["l"] = cl;
  // arrayc.push(objc);

  // const objd = {};
  // objd["l"] = dl;
  // arrayd.push(objd);

  // const obje = {};
  // obje["l"] = el;
  // arraye.push(obje);

  // const objaS = {};
  // objaS["s"] = as;
  // arraya.push(objaS);

  // const objbS = {};
  // objbS["s"] = bs;
  // arrayb.push(objbS);

  // const objcS = {};
  // objcS["s"] = cs;
  // arrayc.push(objcS);

  // const objdS = {};
  // objdS["s"] = ds;
  // arrayd.push(objdS);

  // const objeS = {};
  // objeS["s"] = es;
  // arraye.push(objeS);

  // const objaB = {};
  // objaB["b"] = ab;
  // arraya.push(objaB);

  // const objbB = {};
  // objbB["b"] = bb;
  // arrayb.push(objbB);

  // const objcB = {};
  // objcB["b"] = cb;
  // arrayc.push(objcB);

  // const objdB = {};
  // objdB["b"] = db;
  // arrayd.push(objdB);

  // const objeB = {};
  // objeB["b"] = eb;
  // arraye.push(objeB);

  // const objaC = {};
  // objaC["c"] = ac;
  // arraya.push(objaC);

  // const objbC = {};
  // objbC["c"] = bc;
  // arrayb.push(objbC);

  // const objcC = {};
  // objcC["c"] = cc;
  // arrayc.push(objcC);

  // const objdC = {};
  // objdC["c"] = dc;
  // arrayd.push(objdC);

  // const objeC = {};
  // objeC["c"] = ec;
  // arraye.push(objeC);

  const result = [];

  for (const arr of newArray) {
    let minIndex = -1;
    let minValue = Infinity;

    for (let i = 0; i < arr.length; i++) {
      const obj = arr[i];
      const value = Object.values(obj)[0];
      if (value <= minValue) {
        minIndex = i;
        minValue = value;
      }
    }

    result.push(minIndex);
  }

  const number = result.join("");
  return number;
}
