<script>
export default {
  data () {
    return {
      history: []
    }
  },
  methods: {
    getHistory () {
      return chrome.storage.local.get(['history']).then((result) => {
        console.log('history get', result)
        return result.history
      })
    },
    initHistory () {
      return this.getHistory().then((data) => {
        this.history = data.sort((a, b) => b.timestamp - a.timestamp)
        console.log('mounted', this.history)
      })
    },
    updateHistory (history) {
      return chrome.storage.local.set({ 'history': history }).then((result) => {
        console.log('history updated', result)
      })
    },
    clearHistory () {
      return this.updateHistory([]).then(() => {
        chrome.runtime.sendMessage({ type: 'clearHistory' }).then((response) => {
          this.initHistory()
        })
      })
    },
    formatDate (timestamp) {
      var data = new Date(timestamp)
      var yyyy = data.getFullYear()
      var mm = data.getMonth() + 1 // Months start at 0!
      var dd = data.getDate()

      if (dd < 10) dd = '0' + dd
      if (mm < 10) mm = '0' + mm
      return dd + '.' + mm + '.' + yyyy + ' ' + data.getHours() + ':' + data.getMinutes()
    },
    deleteTab (item) {
      this.getHistory().then((history) => {
        history = history.filter(x => x.url != item.url)
        this.updateHistory(history).then(() => {
          chrome.runtime.sendMessage({ type: 'deleteTab', url: item.url }).then((response) => {
            this.initHistory()
          })
        })
      })
    },
    saveTab () {
      chrome.runtime.sendMessage({ type: 'saveTab' }, (response) => {
        this.initHistory()
      })
    },
    exportCSV () {
      if (this.history) {
        let csvContent = 'data:text/csv;charset=utf-8,'
            + this.history.map(e => e.url).join('\n')
        var encodedUri = encodeURI(csvContent)
        window.open(encodedUri)
        // let content = this.history.map(e => e.url).join("\n");
        // const file = new File([content], "my_links.csv", {
        //   type: "text/csv",
        // });
        // const url = window.URL.createObjectURL(file);
        // window.open(url, '_blank');
        // URL.revokeObjectURL(url);
      }
    },
    copyToClipboard () {
      if (this.history) {
        let content = this.history.map(e => e.url).join('\n')
        navigator.clipboard.writeText(content)
      }
    },
    onLinkClick (url) {
      chrome.tabs.create({ url: url })
    }
  },
  mounted () {
    this.initHistory()
  },
  computed: {}
}

</script>

<template>
  <div id="main">
    <h2>Сохраненные ссылки</h2>
    <div class="my-3">
      <a class="btn btn-primary btn-sm me-1" role="button" href="#" download="my_links.csv"
         @click.stop.prevent="exportCSV()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-filetype-csv"
             viewBox="0 0 16 16">
          <path fill-rule="evenodd"
                d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM3.517 14.841a1.13 1.13 0 0 0 .401.823c.13.108.289.192.478.252.19.061.411.091.665.091.338 0 .624-.053.859-.158.236-.105.416-.252.539-.44.125-.189.187-.408.187-.656 0-.224-.045-.41-.134-.56a1.001 1.001 0 0 0-.375-.357 2.027 2.027 0 0 0-.566-.21l-.621-.144a.97.97 0 0 1-.404-.176.37.37 0 0 1-.144-.299c0-.156.062-.284.185-.384.125-.101.296-.152.512-.152.143 0 .266.023.37.068a.624.624 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.092 1.092 0 0 0-.2-.566 1.21 1.21 0 0 0-.5-.41 1.813 1.813 0 0 0-.78-.152c-.293 0-.551.05-.776.15-.225.099-.4.24-.527.421-.127.182-.19.395-.19.639 0 .201.04.376.122.524.082.149.2.27.352.367.152.095.332.167.539.213l.618.144c.207.049.361.113.463.193a.387.387 0 0 1 .152.326.505.505 0 0 1-.085.29.559.559 0 0 1-.255.193c-.111.047-.249.07-.413.07-.117 0-.223-.013-.32-.04a.838.838 0 0 1-.248-.115.578.578 0 0 1-.255-.384h-.765ZM.806 13.693c0-.248.034-.46.102-.633a.868.868 0 0 1 .302-.399.814.814 0 0 1 .475-.137c.15 0 .283.032.398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.441 1.441 0 0 0-.489-.272 1.838 1.838 0 0 0-.606-.097c-.356 0-.66.074-.911.223-.25.148-.44.359-.572.632-.13.274-.196.6-.196.979v.498c0 .379.064.704.193.976.131.271.322.48.572.626.25.145.554.217.914.217.293 0 .554-.055.785-.164.23-.11.414-.26.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.799.799 0 0 1-.118.363.7.7 0 0 1-.272.25.874.874 0 0 1-.401.087.845.845 0 0 1-.478-.132.833.833 0 0 1-.299-.392 1.699 1.699 0 0 1-.102-.627v-.495Zm8.239 2.238h-.953l-1.338-3.999h.917l.896 3.138h.038l.888-3.138h.879l-1.327 4Z"/>
        </svg>
        Скачать
      </a>
      <button class="btn btn-info btn-sm me-1" role="button" @click="copyToClipboard()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
             class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
          <path fill-rule="evenodd"
                d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
          <path fill-rule="evenodd"
                d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
        </svg>
        Копировать
      </button>
      <button class="btn btn-warning btn-sm me-1" type="button" @click="clearHistory()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x"
             viewBox="0 0 16 16">
          <path
              d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
        Очистить
      </button>
      <button class="btn btn-success btn-sm me-1" type="button" @click="saveTab()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart"
             viewBox="0 0 16 16">
          <path
              d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
        </svg>
        Сохранить закладку
      </button>
    </div>
    <div class="my-3" style="max-height:400px; overflow:auto">
      <div v-if="!history || history.length==0">Ссылок еще нет</div>
      <table v-if="history && history.length>0" class="table ">
        <tbody>
        <tr v-for="item in history">
          <td><img style="width:16px; height:16px" :src="item.favIconUrl"/></td>
          <td style="max-width:300px; " class="text-truncate"><a :href="item.url" :title="item.url" class="text-small"
                                                                 @click="onLinkClick(item.url)">{{ item.title && item.title.length > 0 ? item.title : item.url }}</a>
          </td>
          <td style="width:150px; overflow:hidden;">
            <div class="text-muted" style="font-size:12px;">{{ formatDate(item.timestamp) }}</div>
          </td>
          <td>
            <button type="button" class="btn btn-outline-danger btn-sm" @click="deleteTab(item)">
              <!-- <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg> -->
              Удалить
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

