$('#anchor').rangeSlider('reset');

$('#anchor').rangeSlider(
  {
    direction: 'horizontal', // or vertical
    settings: false,
    skin: 'red',
    type: 'interval', // or single
    scale: true,
    tip: true,
    bar: true,
  },
  {
    step: 1,
    values: [10, 20],
    min: 0,
    max: 30,
  },
);

$('#anchor').rangeSlider('onChange', event => console.log(event.detail));