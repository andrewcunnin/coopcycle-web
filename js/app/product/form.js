import Dropzone from 'dropzone'
import DropzoneWidget from '../widgets/Dropzone'
import Sortable from 'sortablejs'
import _ from 'lodash'
import numbro from 'numbro'

import '../i18n'

Dropzone.autoDiscover = false

$(function() {

  const el = document.querySelector('#product-image-dropzone')

  if (el) {
    const formData = document.querySelector('#product-form-data')
    new DropzoneWidget(el, {
      dropzone: {
        url: formData.dataset.actionUrl,
        params: {
          type: 'product',
          id: formData.dataset.productId
        }
      },
      image: formData.dataset.productImage,
      size: [ 256, 256 ]
    })
  }
})

$('#product_reusablePackagingEnabled').click(function() {
  if ($(this).is(":checked")) {
    $('#product_reusablePackaging').closest('.form-group').show()
    $('#product_reusablePackagingUnit').closest('.form-group').show()
  } else {
    $('#product_reusablePackaging').closest('.form-group').hide()
    $('#product_reusablePackagingUnit').closest('.form-group').hide()
  }
})

if (!$('#product_reusablePackagingEnabled').is(":checked")) {
  $('#product_reusablePackaging').closest('.form-group').hide()
  $('#product_reusablePackagingUnit').closest('.form-group').hide()
}

new Sortable(document.querySelector('#product_options'), {
  group: 'products',
  animation: 250,
  onUpdate: function(e) {
    let i = 0
    Array.prototype.slice.call(e.to.children).forEach((el) => {
      const enabled = el.querySelector('input[type="checkbox"]')
      const pos = el.querySelector('[data-name="position"]')
      pos.value = enabled.checked ? i++ : -1
    })
  },
})

const getRateAmount = (el) => {

  const taxCategories = JSON.parse(el.dataset.taxCategories)
  const value = el.options[el.selectedIndex].value
  const rates = taxCategories[value]
  const rate = _.first(rates)

  return rate.amount
}

document.querySelectorAll('[data-tax-categories]').forEach(el => {

  const taxIncludedEl = document.querySelector(el.dataset.included)
  const taxExcludedEl = document.querySelector(el.dataset.excluded)

  el.addEventListener('change', (e) => {

    const amount = getRateAmount(e.target)

    let taxIncluded = taxIncludedEl.value
    taxIncluded = taxIncluded.replace(',', '.')
    taxIncluded = parseFloat(taxIncluded)
    taxIncluded = parseInt(taxIncluded * 100, 10)

    const vatAmount = Math.round(taxIncluded - (taxIncluded / (1 + amount)))
    const taxExcluded = taxIncluded - vatAmount

    taxExcludedEl.value = numbro(taxExcluded / 100).format({ mantissa: 2 })

  })

  taxExcludedEl.addEventListener('input', (e) => {
    const value = numbro.unformat(e.target.value)

    if (!value || _.isNaN(value)) {
      taxIncludedEl.value = '0'
      return
    }

    const valueInCents = parseInt(value * 100, 10)
    const rateAmount = getRateAmount(el)

    const taxIncluded = valueInCents * (1 + rateAmount)

    taxIncludedEl.value = numbro(taxIncluded / 100).format({ mantissa: 2 })
  })

  taxIncludedEl.addEventListener('input', (e) => {
    const value = numbro.unformat(e.target.value)

    if (!value || _.isNaN(value)) {
      taxExcludedEl.value = '0'
      return
    }

    const valueInCents = parseInt(value * 100, 10)
    const rateAmount = getRateAmount(el)

    const vatAmount = Math.round(valueInCents - (valueInCents / (1 + rateAmount)))
    const taxExcluded = valueInCents - vatAmount

    taxExcludedEl.value = numbro(taxExcluded / 100).format({ mantissa: 2 })
  })
})
