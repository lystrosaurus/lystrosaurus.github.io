const { getCategoryColor } = require('../../utils/format');

Component({
  properties: {
    book: { type: Object, value: {} },
    category: { type: Object, value: null },
  },
  data: {
    catColor: '#c9954a',
  },
  observers: {
    category(cat) {
      if (cat && cat.id) {
        this.setData({ catColor: getCategoryColor(cat.id) });
      }
    },
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.data.book.id });
    },
  },
});
