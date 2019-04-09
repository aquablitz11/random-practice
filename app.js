let frame = {
  states: [],
  text: "",
  copy: function() {
    let newframe = { states: this.states.slice(), text: this.text }
    return newframe
  }
}

Vue.component("visualizer", {
  props: [ "needle", "haystack", "type" ],
  data: function() {
    let ret = { arr: [], frames: [], frameIdx: 0 }
    ret.arr = JSON.parse(this.haystack)
    if (this.type == "binary")
      ret.frames = this.binary_search(ret.arr, parseInt(this.needle))
    else if (this.type == "linear")
      ret.frames = this.linear_search(ret.arr, parseInt(this.needle))
    return ret
  },
  watch: {
    needle: function() {
      this.arr = JSON.parse(this.haystack)
      if (this.type == "binary")
        this.frames = this.binary_search(this.arr, parseInt(this.needle))
      else if (this.type == "linear")
        this.frames = this.linear_search(this.arr, parseInt(this.needle))
    },
    haystack: function() {
      this.arr = JSON.parse(this.haystack)
      if (this.type == "binary")
        this.frames = this.binary_search(this.arr, parseInt(this.needle))
      else if (this.type == "linear")
        this.frames = this.linear_search(this.arr, parseInt(this.needle))
    }
  },
  template: `
    <div class="example">
      <input type="range" min="0" :max="frames.length-1" v-model="frameIdx" class="slider">
      <br>
      <template v-for="(val, idx) in arr">
        <template v-if="frames[frameIdx].states[idx] === -1">
          <span class="number ignored">{{ val }}</span>
        </template>
        <template v-else-if="frames[frameIdx].states[idx] === 0">
          <span class="number">{{ val }}</span>
        </template>
        <template v-else-if="frames[frameIdx].states[idx] === 1">
          <span class="number comparing">{{ val }}</span>
        </template>
        <template v-else-if="frames[frameIdx].states[idx] === 2">
          <span class="number accept">{{ val }}</span>
        </template>
        <template v-else-if="frames[frameIdx].states[idx] === 3">
          <span class="number discard">{{ val }}</span>
        </template>
        <template v-else>

        </template>
      </template>
      <br>
      <span class="step-num">( {{parseInt(frameIdx)+1}} / {{frames.length}} )</span><br>
      <span class="explanation">{{frames[frameIdx].text}}</span>
    </div>
  `,
  methods: {
    linear_search: function(arr, x) {
      let n = arr.length
      let ret = []
      frame.states = Array(n)
      for (var i = 0; i < n; ++i) {
        for (var j = 0; j < n; ++j) {
          if (j < i) frame.states[j] = -1
          else if (j == i) frame.states[j] = arr[i]>x?3:arr[i]==x?2:1
          else frame.states[j] = arr[i]>=x?-1:0
        }
        if (arr[i] > x) {
          frame.text = `A[${i}]=${arr[i]} is greater than x=${x} so we terminate the search.`
          ret.push(frame.copy())
          break
        } else if (arr[i] == x) {
          frame.text = `A[${i}]=${arr[i]} is equal to x=${x}!`
          ret.push(frame.copy())
          break
        } else {
          frame.text = `A[${i}]=${arr[i]} is still less than x=${x}. Keep going.`
          ret.push(frame.copy())
        }
      }
      return ret
    },

    binary_search: function(arr, x) {
      let n = arr.length
      frame.states = Array(n)
      let l = 0, r = n-1
      let ret = []
      let cnt = 0
      while (l <= r) {
        // create range frame
        for (var i = 0; i < n; ++i) {
          if (i < l || i > r) frame.states[i] = -1
          else frame.states[i] = 0
          frame.text = `Searching for x=${x} in range [${l}, ${r}]`
        }
        ret.push(frame.copy())
        // create comparison frame
        let m = parseInt((l+r)/2)
        for (var i = 0; i < n; ++i) {
          if (i < l || i > r) frame.states[i] = -1
          else if (i == m) frame.states[i] = 1
          else frame.states[i] = 0
          frame.text = `Value of A[${m}] is ${arr[m]} which is `
          if (arr[m] < x) frame.text += `less than x=${x}`
          else if (arr[m] == x) frame.text += `equal to x=${x}!`
          else frame.text += `greater than x=${x}`
        }
        ret.push(frame.copy())
        // compare
        if (arr[m] == x) {
          for (var i = 0; i < n; ++i) {
            if (i != m) frame.states[i] = -1
            else frame.states[i] = 2
          }
          frame.text = `We can terminate the search and return m=${m}`
          ret.push(frame.copy())
          return ret
        } else if (arr[m] > x) {
          for (var i = 0; i < n; ++i) {
            if (i < l || i > r) frame.states[i] = -1
            else if (i < m) frame.states[i] = 2
            else if (i > m) frame.states[i] = 3
            else frame.states[i] = 1
          }
          frame.text = `Therefore, we'll continue the search on the left side ([${l}, ${m-1}])`
          r = m-1
          ret.push(frame.copy())
        } else if (arr[m] < x) {
          for (var i = 0; i < n; ++i) {
            if (i < l || i > r) frame.states[i] = -1
            else if (i < m) frame.states[i] = 3
            else if (i > m) frame.states[i] = 2
            else frame.states[i] = 1
          }
          frame.text = `Therefore, we'll continue the search on the right side ([${m+1}, ${r}])`
          l = m+1
          ret.push(frame.copy())
        }
      }
      for (var i = 0; i < n; ++i)
        frame.states[i] = -1
      frame.text = `Range [${l}, ${r}] is invalid. We conclude that x=${x} doesn't exist in this array.`
      ret.push(frame.copy())
      return ret
    }

  }
})

var app = new Vue({
  el: "#app",
  data: {
    haystackstr: "[1,1,2,3,5,8,13,21,34,55,89]",
    needlestr: "39"
  }
})
