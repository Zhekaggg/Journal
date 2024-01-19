import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';

Modal.setAppElement('#root');

export const PocoFunctions = () => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('journalData');
    return savedData
      ? JSON.parse(savedData)
      : {
          '9г-121': [
            { id: 1, student: 'Куртов Женда' },
            { id: 2, student: 'Владислав Доренов' },
            { id: 3, student: 'Хохлов Илья' },
          ],
          '9-121': [
            { id: 4, student: 'Игорь Ченазес' },
            { id: 5, student: 'Авган Авран' },
          ],
        };
  });
    
      const [selectedGroup, setSelectedGroup] = useState('9г-121');
      const [modalIsOpen, setModalIsOpen] = useState(false);
      const [selectedCell, setSelectedCell] = useState(null);
// Poco.js
const [selectedDates, setSelectedDates] = useState(() => {
  const savedData = localStorage.getItem('journalData');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    const firstGroup = Object.keys(parsedData)[0];
    const savedSelectedDates = localStorage.getItem('selectedDates'); // Assuming at least one group is available
    const firstStudent = parsedData[firstGroup][0]; // Assuming at least one student is available
    const numberOfDates = Object.keys(firstStudent).filter(key => !isNaN(key)).length;
    return Array.from({ length: numberOfDates }, (_, index) => new Date());
  } else {
    return Array.from({ length: 6 }, () => new Date());
  }
});
      const [newStudentModalIsOpen, setNewStudentModalIsOpen] = useState(false);
      const [newStudent, setNewStudent] = useState({ name: '', group: '', existingGroups: Object.keys(data) });
      const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
      const [studentToDelete, setStudentToDelete] = useState(null);
    
      const columns = React.useMemo(() => {
        const dateColumns = selectedDates.map((date, index) => {
          const day = index + 1;
          return {
            Header: () => (
              <div style={{ width: '60px' }}>
                <DatePicker
                  selected={date}
                  onChange={(newDate) => handleDateChange(newDate, index)}
                  dateFormat="dd.MM"
                  wrapperClassName="date-picker-wrapper"
                  className="date-picker-input"
                />
              </div>


            ),
            accessor: day.toString(),
          };
        });
    
        return [
          { Header: 'Ученик', accessor: 'student' },
          ...dateColumns,
        ];
      }, [selectedDates]);
    
      const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
      } = useTable({ columns, data: data[selectedGroup] });


    
      const handleCellChange = (rowIndex, columnIndex) => {
        if (columnIndex !== 0) {
          setSelectedCell({ rowIndex, columnIndex });
          setModalIsOpen(true);
        }
      };
    
      const handleModalClose = () => {
        setModalIsOpen(false);
        setSelectedCell(null);
      };
    
      const handleGradeSelect = (grade) => {
        const { rowIndex, columnIndex } = selectedCell;
        const updatedData = { ...data };
        updatedData[selectedGroup][rowIndex][columnIndex] = grade;
        setData(updatedData);
        setModalIsOpen(false);
        setSelectedCell(null);
      };
    
      const handleClearCell = () => {
        const { rowIndex, columnIndex } = selectedCell;
        const updatedData = { ...data };
        updatedData[selectedGroup][rowIndex][columnIndex] = '';
        setData(updatedData);
        setModalIsOpen(false);
        setSelectedCell(null);
      };
    
      const handleDateChange = (date, columnIndex) => {
        setSelectedDates((prevDates) => {
          const newDates = [...prevDates];
          newDates[columnIndex] = date;
          return newDates;
        });
    
        if (selectedCell) {
          const { rowIndex, columnIndex } = selectedCell;
          const updatedData = { ...data };
          updatedData[selectedGroup][rowIndex][columnIndex] = date.toLocaleDateString();
          setData(updatedData);
          setModalIsOpen(false);
          setSelectedCell(null);
        }
      };
    
      const openNewStudentModal = () => {
        setNewStudentModalIsOpen(true);
      };
    
      const closeNewStudentModal = () => {
        setNewStudentModalIsOpen(false);
        setNewStudent({ name: '', group: '', existingGroups: Object.keys(data) });
      };
    
      const handleNewStudentChange = (e) => {
        const { name, value } = e.target;
        setNewStudent((prevStudent) => ({ ...prevStudent, [name]: value }));
      };

      // Poco.js
      const addNewDay = () => {
        setSelectedDates((prevDates) => {
          const newDate = new Date();
          return [...prevDates, newDate];
        });
    
        const updatedData = { ...data };
        const selectedGroupData = updatedData[selectedGroup];
    
        if (selectedGroupData) {
          selectedGroupData.forEach((student) => {
            const newDay = selectedDates.length + 1;
            student[newDay] = '';
          });
        }
    
        setData(updatedData);
      };
    
      const handleAddNewStudent = () => {
        const { name, group, existingGroups } = newStudent;
        if (name && group) {
          const updatedData = { ...data };
          if (!existingGroups.includes(group)) {
            updatedData[group] = [];
          }
          const newStudentObj = { id: Date.now(), student: name };
          for (let i = 1; i <= selectedDates.length; i++) {
            newStudentObj[i] = '';
          }
          updatedData[group] = [...updatedData[group], newStudentObj];
          setData(updatedData);
          closeNewStudentModal();
        }
      };
    
      const openDeleteModal = (student) => {
        setStudentToDelete(student);
        setDeleteModalIsOpen(true);
      };
    
      const closeDeleteModal = () => {
        setStudentToDelete(null);
        setDeleteModalIsOpen(false);
      };
    
      const handleDeleteStudent = () => {
        if (studentToDelete) {
          const { id } = studentToDelete;
          const updatedData = { ...data };
          updatedData[selectedGroup] = updatedData[selectedGroup].filter((student) => student.id !== id);
          setData(updatedData);
          closeDeleteModal();
        }
      };
      const deleteLastDay = () => {
        setSelectedDates((prevDates) => {
          if (prevDates.length > 0) {
            const newDates = [...prevDates];
            newDates.pop(); // Remove the last day
            return newDates;
          }
          return prevDates;
        });
    
        const updatedData = { ...data };
        const selectedGroupData = updatedData[selectedGroup];
    
        if (selectedGroupData) {
          selectedGroupData.forEach((student) => {
            const lastDay = selectedDates.length;
            delete student[lastDay];
          });
        }
    
        setData(updatedData);
      };


      // ВДАВДЛА
      const [importModalIsOpen, setImportModalIsOpen] = useState(false);
      const [selectedFile, setSelectedFile] = useState(null);
    
      const openImportModal = () => {
        setImportModalIsOpen(true);
      };
    
      const closeImportModal = () => {
        setImportModalIsOpen(false);
        setSelectedFile(null);
      };
    
      const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
      };
    
      const handleImport = () => {
        if (selectedFile && selectedGroup) {
          importExcel(selectedFile, selectedGroup);
          closeImportModal();
        }
      };
    
      const importExcel = (file, selectedGroup) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const importedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
            // Update the data for the selected group
            const updatedData = { ...data };
            updatedData[selectedGroup] = [];
            const [headerRow, ...rows] = importedData;
            rows.forEach((row) => {
              const newStudentObj = { id: Date.now(), student: row[0] };
              for (let i = 1; i < row.length; i++) {
                newStudentObj[i] = row[i];
              }
              updatedData[selectedGroup].push(newStudentObj);
            });
            setData(updatedData);
          } catch (error) {
            console.error('Error importing Excel file:', error);
          }
        };
    
        reader.readAsBinaryString(file);
      };
    
      useEffect(() => {
        localStorage.setItem('journalData', JSON.stringify(data));
      }, [data, selectedDates]);


      return {
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
      };
};

export default PocoFunctions;
