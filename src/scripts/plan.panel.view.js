'use strict'

import {
  addClass,
  createElement,
  hasClass,
  removeClass
} from './dom'

import {
  off,
  on
} from './delegate'

import { format } from './time'
import marked from 'marked'

import emitter from './plan.emitter'

import {
  PLAN_CLOSE_PANELS,
  PANEL_VIEW_UPDATE,
  PANEL_VIEW_OPEN,
  PANEL_VIEW_CLOSE,
  PANEL_VIEW_EMPTY,
  PANEL_EDIT_UPDATE,
  COLUMNS_OPEN,
  COLUMNS_CLOSE
} from './plan.actions'

const $wrap = document.querySelector('#view-panel')

const Panel = {
  initialize () {
    this.addEventListeners()
  },
  _elements: {
    wrap: $wrap,
    title: $wrap.querySelector('#view-title'),
    create: $wrap.querySelector('#view-create'),
    deadline: $wrap.querySelector('#view-deadline'),
    estimate: $wrap.querySelector('#view-estimate'),
    level: $wrap.querySelector('#view-level'),
    desc: $wrap.querySelector('#view-desc'),
    logs: $wrap.querySelector('#view-logs')
  },
  _plan: {
    id: 1,
    title: '',
    deadline: '',
    estimate: '',
    level: 3,
    desc: '',
    create: '',
    update: [],
    status: 0,
    marked: false,
    delayed: false,
    deleted: false
  },
  addEventListeners () {
    on($wrap, '.view-cancel', 'click', this._onCancelClick, this)
    on($wrap, '.view-edit', 'click', this._onEditClick, this)

    emitter.on(PANEL_VIEW_UPDATE, this.update.bind(this))
    emitter.on(PANEL_VIEW_OPEN, this.open.bind(this))
    emitter.on(PANEL_VIEW_CLOSE, this.close.bind(this))
    emitter.on(PANEL_VIEW_EMPTY, this.empty.bind(this))

    return this
  },
  removeEventListeners () {
    off($wrap, 'click', this._onCancelClick)
    off($wrap, 'click', this._onEditClick)

    emitter.off(PANEL_VIEW_UPDATE, this.update.bind(this))
    emitter.off(PANEL_VIEW_OPEN, this.open.bind(this))
    emitter.off(PANEL_VIEW_CLOSE, this.close.bind(this))
    emitter.off(PANEL_VIEW_EMPTY, this.empty.bind(this))

    return this
  },
  getPlan () {
    return this._plan
  },
  setPlan (plan) {
    this._plan = plan

    return this
  },
  getEls () {
    return this._elements
  },
  close () {
    if (!this.isOpened()) {
      return this
    }

    removeClass($wrap, 'panel-opened')

    emitter.emit(COLUMNS_OPEN)

    this.empty()

    return this
  },
  open () {
    if (this.isOpened()) {
      return this
    }

    emitter.emit(PLAN_CLOSE_PANELS, PANEL_VIEW_CLOSE)

    addClass($wrap, 'panel-opened')

    emitter.emit(COLUMNS_CLOSE)

    return this
  },
  isOpened () {
    return hasClass($wrap, 'panel-opened')
  },
  update (plan) {
    const CLS_LEVEL = 'field-view-level field-level-icon field-level-checked'
    let elements = this.getEls()
    let $title = elements.title
    let $create = elements.create
    let $deadline = elements.deadline
    let $estimate = elements.estimate
    let $level = elements.level
    let $desc = elements.desc
    let $logs = elements.logs
    let $list = createElement('ol', {
      'className': 'panel-logs'
    })
    let $icon

    this.setPlan(plan)

    $title.innerHTML = plan.title
    $create.innerHTML = plan.create
    $deadline.innerHTML = plan.deadline
    $estimate.innerHTML = plan.estimate

    switch (plan.level) {
      case 0:
        $icon = createElement('div', {
          'className': CLS_LEVEL
        }, [
          createElement('i', {
            'className': 'icon-spades'
          })
        ])
        break
      case 1:
        $icon = createElement('div', {
          'className': CLS_LEVEL
        }, [
          createElement('i', {
            'className': 'icon-heart'
          })
        ])
        break
      case 2:
        $icon = createElement('div', {
          'className': CLS_LEVEL
        }, [
          createElement('i', {
            'className': 'icon-clubs'
          })
        ])
        break
      case 3:
        $icon = createElement('div', {
          'className': CLS_LEVEL
        }, [
          createElement('i', {
            'className': 'icon-diamonds'
          })
        ])
        break
    }

    $level.innerHTML = ''
    $level.appendChild($icon)

    $desc.innerHTML = marked(plan.desc)

    plan.update.forEach(log => {
      let $operate = createElement('span', {
        'className': 'panel-log-operate'
      }, [
        log.operate
      ])
      let $time = createElement('span', {
        'className': 'panel-log-time'
      }, [
        format(log.time, 'MM-dd hh:mm')
      ])
      let $li = createElement('li', {
        'className': 'panel-log'
      }, [
        $operate,
        $time
      ])

      $list.appendChild($li)
    })

    $logs.innerHTML = ''
    $logs.appendChild($list)

    this.open()

    return this
  },
  empty () {
    let elements = this.getEls()
    let $title = elements.title
    let $create = elements.create
    let $deadline = elements.deadline
    let $estimate = elements.estimate
    let $level = elements.level
    let $desc = elements.desc
    let $logs = elements.logs

    $title.innerHTML = ''
    $create.innerHTML = ''
    $deadline.innerHTML = ''
    $estimate.innerHTML = ''
    $level.innerHTML = ''
    $desc.innerHTML = ''
    $logs.innerHTML = ''

    return this
  },
  _onCancelClick () {
    this.close()

    return this
  },
  _onEditClick () {
    emitter.emit(PANEL_EDIT_UPDATE, this.getPlan())

    return this
  }
}

export default Panel
