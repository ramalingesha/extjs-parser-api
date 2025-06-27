// Ext.create('Ext.form.TextField', {
//   fieldLabel: 'User Name',
//   name: 'username',
//   listeners: {
//     change: onChange
//   }
// });

Ext.onReady(function () {
  Ext.create('Ext.form.FormPanel', {
    title: 'User Form',
    width: 500,
    renderTo: Ext.getBody(),
    items: [
      {
        xtype: 'textfield',
        fieldLabel: 'First Name',
        name: 'firstName',
        emptyText: 'Enter first name',
        listeners: {
          change: onFirstNameChange
        }
      },
      {
        xtype: 'textfield',
        fieldLabel: 'Last Name',
        name: 'lastName',
        value: 'Doe',
        listeners: {
          blur: onLastNameBlur
        }
      },
      {
        xtype: 'textarea',
        fieldLabel: 'Address',
        name: 'address'
      },
      {
        xtype: 'numberfield',
        fieldLabel: 'Age',
        name: 'age'
      },
      {
        xtype: 'datefield',
        fieldLabel: 'Date of Birth',
        name: 'dob'
      },
      {
        xtype: 'combobox',
        fieldLabel: 'Country',
        name: 'country',
        store: ['India', 'USA', 'Germany'],
        listeners: {
          select: onCountrySelect
        }
      },
      {
        xtype: 'checkbox',
        boxLabel: 'I agree to terms',
        name: 'agreement'
      },
      {
        xtype: 'radiogroup',
        fieldLabel: 'Gender',
        items: [
          { boxLabel: 'Male', name: 'gender', inputValue: 'M' },
          { boxLabel: 'Female', name: 'gender', inputValue: 'F' }
        ]
      },
      {
        xtype: 'panel',
        title: 'Extra Details',
        layout: 'form',
        items: [
          {
            xtype: 'textfield',
            fieldLabel: 'Hobby',
            name: 'hobby'
          }
        ]
      },
      {
        xtype: 'button',
        text: 'Submit',
        handler: onSubmitClick
      }
    ]
  });
});