<template>
  <svg xmlns="http://www.w3.org/2000/svg"
  width = "100" height = "100" viewBox= "0 0 100 100" fill="black" stroke ="black">
    <circle cx="50" cy="70" r="4" opacity = "0">
      <animate attributeName = "opacity" begin = "0s" from = "0" to = "1" dur ="0.2s"  fill = "freeze"/>
    </circle>
    <rect stroke = "none" width ="8" height = "2" x="46" y="60" id ="head" opacity = "0">
      <animate attributeName = "opacity" begin = "0.2s" from = "0" to = "1" dur ="0.2s"  fill = "freeze"/>
      <animate attributeName = "height"
        from = "0" to = "35" dur ="0.2s"
        fill = "freeze"
        begin = "0.2s"
      />
      <animate
        attributeName = "y"
        from = "60" to = "25" dur ="0.2s"
        fill = "freeze"
        begin = "0.2s"
      />
    </rect>

    <circle cx="50" cy="50" r="40" fill = "none"  transform ="rotate(270,50,50)"
      stroke-width="4" stroke-dasharray = "272" stroke-dashoffset = "272">
      <animate attributeName = "opacity" from = "0" to = "1" dur ="1s"  fill = "freeze"/>
      <animate begin = "0.4s" attributeName="stroke-dashoffset" from="272" to="20" dur="0.2s" key="" fill="freeze" />
    </circle>
  </svg>
</template>
