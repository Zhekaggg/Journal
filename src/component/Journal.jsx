import React, { useState, useEffect } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import PocoFunctions from './Poco';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import * as XLSX from 'xlsx';

const animatedComponents = makeAnimated();

const Journal = () => {
  const {
    data,
    selectedGroup,
    modalIsOpen,
    selectedCell,
    selectedDates,
    addNewDay,
    setSelectedGroup,
    newStudentModalIsOpen,
    newStudent,
    deleteModalIsOpen,
    studentToDelete,
    columns,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    handleCellChange,
    handleModalClose,
    handleGradeSelect,
    handleClearCell,
    handleDateChange,
    openNewStudentModal,
    closeNewStudentModal,
    handleNewStudentChange,
    handleAddNewStudent,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteStudent,
    deleteLastDay,

    openImportModal,
    handleFileChange,
    handleImport,
    importExcel,
    importModalIsOpen,
    closeImportModal 

  } = PocoFunctions();
  

  useEffect(() => {
    localStorage.setItem('journalData', JSON.stringify(data));
  }, [data, selectedDates]);


  const exportToExcel = () => {
    const exportData = data[selectedGroup].map((student) => {
      const studentData = selectedDates.map((date, index) => student[(index + 1).toString()]);
      return [student.student, ...studentData];
    });

    const ws = XLSX.utils.aoa_to_sheet([['Ученик', ...selectedDates], ...exportData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Журнал_${selectedGroup}`);
    XLSX.writeFile(wb, `${selectedGroup}.xlsx`);
  };
  return (
    <div className="journal-container">
      <h1>Журнал</h1>
      <div className="header">
        <div className='pkp'>
        <div className="select-container">
            <Select
              options={Object.keys(data).map(group => ({ value: group, label: group }))}
              value={{ value: selectedGroup, label: selectedGroup }}
              onChange={(selectedOption) => setSelectedGroup(selectedOption.value)}
              components={animatedComponents}
            />
          </div>
        </div>
        <div className="oco"style={{ margin: '5px' }} >
        <Button variant="contained" className="oco1" onClick={addNewDay}>
              Добавить день
            </Button>
            <Button variant="contained" className="oco2" onClick={deleteLastDay}>
              Удалить день
            </Button>
            <Button variant="contained" className="oco3" onClick={openNewStudentModal}>
              Добавить ученика
            </Button>
          </div>
      </div>

      <div className="table-container">
        <table {...getTableProps()} className="scroll-table">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    style={{ border: '1px solid black', padding: '8px' }}
                  >
                    {column.render('Header')}
                  </th>
                ))}
                <th style={{ border: '1px solid black', padding: '8px' }}>Действия</th>
              </tr>
            ))}
          </thead>
  <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell, index) => (
                    <td
                      {...cell.getCellProps()}
                      style={{
                        border: '1px solid black',
                        padding: '8px',
                        cursor: index !== 0 ? 'pointer' : 'default',
                      }}
                      onClick={() => handleCellChange(row.index, index)}
                    >
                      {index === 0 ? cell.render('Cell') : data[selectedGroup][row.index][cell.column.id]}
                    </td>
                  ))}
                  <td style={{ border: '1px solid black', padding: '8px' }}>
                    <button onClick={() => openDeleteModal(row.original)}>Удалить</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
         
          
      </div><div className="oco">
          <Button variant="contained" className="oco4" onClick={exportToExcel}>
              Экспорт в Excel
            </Button>
            <Button variant="contained" className="oco5" onClick={openImportModal}>
  Импорт Excel
</Button>

          </div>

      <div className="footer">
        <p>Было потрачено ровно 0 рупий, нервов было потрачено 20 килограмм.</p>
        <p>за нами следят везде камеры уходи они рядом.</p>
        <p>Потери при проекте: 2 человека.</p>
        <p>Конец.</p>
      </div>
      <Modal
        open={modalIsOpen}
        onClose={handleModalClose}
        center
        styles={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          modal: {
            width: '80%',
            maxWidth: '400px', // Настройте максимальную ширину для мобильных устройств
            borderRadius: '8px',
          },
        }}
      >
        <h2>Выберите оценку:</h2>
        <Button variant="outlined" onClick={() => handleGradeSelect('Н')}>Н - не было на уроке</Button>
        {[2, 3, 4, 5].map((grade) => (
          <Button variant="outlined" key={grade} onClick={() => handleGradeSelect(grade)}>
            {grade}
          </Button>
        ))}
        <Button  variant="outlined" onClick={handleClearCell}>Очистить ячейку</Button>
      </Modal>

      <Modal
        open={newStudentModalIsOpen}
        onClose={closeNewStudentModal}
        center
        styles={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          modal: {
            width: '80%',
            maxWidth: '400px', // Настройте максимальную ширину для мобильных устройств
            borderRadius: '8px',
          },
        }}
      >
        <h2>Добавить нового ученика:</h2>
        
          <input class="input" 
          placeholder="ФИО" 
          type="text"
           name="name" 
           value={newStudent.name} 
           onChange={handleNewStudentChange}
           style={{ marginBottom: '10px' }}  />

          <input class="input" 
          placeholder="Группа" 
          type="text" name="group" 
          value={newStudent.group} 
          onChange={handleNewStudentChange} 
          style={{ marginBottom: '10px' }} />
        <Button variant="outlined" onClick={handleAddNewStudent}>Добавить ученика</Button>
      </Modal>

      <Modal
        open={deleteModalIsOpen}
        onClose={closeDeleteModal}
        center
        styles={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          modal: {
            width: '80%',
            maxWidth: '400px', // Настройте максимальную ширину для мобильных устройств
            borderRadius: '8px',
          },
        }}
      >
        <h2>Вы действительно хотите удалить ученика?</h2>
        <p>{studentToDelete && studentToDelete.student}</p>
        <Button  variant="outlined"  onClick={handleDeleteStudent}>Удалить</Button>
        <Button  variant="outlined" onClick={closeDeleteModal}>Отмена</Button>
      </Modal>

      <Modal
        open={importModalIsOpen}
        onClose={closeImportModal}
        center
        styles={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          modal: {
            width: '80%',
            maxWidth: '400px',
            borderRadius: '8px',
          },
        }}
      >
        <h2>Выберите файл Excel и группу:</h2>
        <input type="file" onChange={handleFileChange} />
        <Select
          options={Object.keys(data).map((group) => ({ value: group, label: group }))}
          value={{ value: selectedGroup, label: selectedGroup }}
          onChange={(selectedOption) => setSelectedGroup(selectedOption.value)}
          components={animatedComponents}
        />
        <Button variant="outlined" onClick={handleImport}>
          Импортировать
        </Button>
      </Modal>
    </div>
  );
};

export default Journal;
