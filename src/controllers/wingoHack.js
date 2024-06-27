export const calculatePayoutsWithColors = (bets) => {
  const betMultipliers = {
    0: 9,
    1: 9,
    2: 9,
    3: 9,
    4: 9,
    5: 9,
    6: 9,
    7: 9,
    8: 9,
    9: 9,
    l: 2,
    n: 2,
    d: 4.5,
    x: 4.5,
    t: 4.5,
  };
// d for red, x for green, t for voilet, n for small, l for long
  const smallNumbers = ["0", "1", "2", "3", "4"];
  const bigNumbers = ["5", "6", "7", "8", "9"];
  const greenNumbers = ["1", "3", "7", "9", "5"];
  const redNumbers = ["0", "2", "4", "6", "8"];
  const violetNumbers = ["0", "5"];

  let zero = 0;
  let one = 0;
  let two = 0;
  let three = 0;
  let four = 0;
  let five = 0;
  let six = 0;
  let seven = 0;
  let eight = 0;
  let nine = 0;
  let small = 0;
  let big = 0;
  let red = 0;
  let violet = 0;
  let green = 0;
  bets.map((item) => {
    switch (item.bet) {
      case "0":
        zero += item.money * betMultipliers["0"];
        break;
      case "1":
        one += item.money * betMultipliers["1"];
        break;
      case "2":
        two += item.money * betMultipliers["2"];
        break;
      case "3":
        three += item.money * betMultipliers["3"];
        break;
      case "4":
        four += item.money * betMultipliers["4"];
        break;
      case "5":
        five += item.money * betMultipliers["5"];
        break;
      case "6":
        six += item.money * betMultipliers["6"];
        break;
      case "7":
        seven += item.money * betMultipliers["7"];
        break;
      case "8":
        eight += item.money * betMultipliers["8"];
        break;
      case "9":
        nine += item.money * betMultipliers["9"];
        break;
      case "n":
        small += item.money * betMultipliers["n"];
        break;
      case "l":
        big += item.money * betMultipliers["l"];
        break;
      case "d":
        red += item.money * betMultipliers["d"];
        break;
      case "x":
        green += item.money * betMultipliers["x"];
        break;
      case "t":
        violet += item.money * betMultipliers["t"];
        break;
      default:
        break;
    }
  });
  const totalPayouts = {
    0: zero,
    1: one,
    2: two,
    3: three,
    4: four,
    5: five,
    6: six,
    7: seven,
    8: eight,
    9: nine,
    n: small,
    l: big,
    d: red,
    x: green,
    t: violet,
  };
  function updatePayouts() {
    smallNumbers.forEach((num) => (totalPayouts[num] += totalPayouts["n"]));
    bigNumbers.forEach((num) => (totalPayouts[num] += totalPayouts["l"]));
    greenNumbers.forEach((num) => (totalPayouts[num] += totalPayouts["x"]));
    redNumbers.forEach((num) => (totalPayouts[num] += totalPayouts["d"]));
    violetNumbers.forEach((num) => (totalPayouts[num] += totalPayouts["t"]));
  }

  // Call the function to update payouts
  updatePayouts();
  // Filter out the numbers (0-9) with the lowest value
  const lowestValue = Math.min(
    ...Object.entries(totalPayouts)
      .filter(([key, _]) => !isNaN(key))
      .map(([_, value]) => value)
  );

  const numbersWithLowestValue = Object.keys(totalPayouts).filter(
    (key) => !isNaN(key) && totalPayouts[key] === lowestValue
  );

  // Select a random number from those with the lowest value
  const randomLowestValueNumber =
    numbersWithLowestValue[
      Math.floor(Math.random() * numbersWithLowestValue.length)
    ];

  return randomLowestValueNumber;
};
