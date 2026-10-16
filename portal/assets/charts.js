// Small dependency-free SVG chart helpers — no external charting library needed
// for the handful of stats this portal shows.

export function barChartHTML(data, opts) {
  opts = opts || {};
  var max = Math.max.apply(null, data.map(function(d){ return d.value; }).concat([1]));
  var height = opts.height || 100;
  return '<div class="bar-chart">' + data.map(function(d){
    var h = Math.max(Math.round((d.value / max) * height), 2);
    return '<div class="bar-col">' +
      '<div style="font-size:.68rem;font-weight:700;">' + d.value + '</div>' +
      '<div class="bar" style="height:' + h + 'px;' + (d.color ? 'background:' + d.color + ';' : '') + '"></div>' +
      '<div class="bar-lbl">' + d.label + '</div>' +
    '</div>';
  }).join('') + '</div>';
}

export function ringChartHTML(percent, opts) {
  opts = opts || {};
  var size = opts.size || 64;
  var stroke = opts.stroke || 8;
  var color = opts.color || '#feba02';
  var r = (size - stroke) / 2;
  var c = size / 2;
  var circumference = 2 * Math.PI * r;
  var offset = circumference * (1 - Math.min(Math.max(percent, 0), 100) / 100);
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
    '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="#e7eaf2" stroke-width="' + stroke + '"/>' +
    '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke +
      '" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '" stroke-linecap="round" transform="rotate(-90 ' + c + ' ' + c + ')"/>' +
  '</svg>';
}
