'use client';

import { useEffect, useState } from "react";
import apiClient from "@/lib/api/client";
import Button from "@/components/shared/Button/Button";
import Table, { TableColumn } from "@/components/shared/Table/Table";
import PermissionForm from "./PermissionForm";
import { EmployeeListItemResponse } from "@/types/hr.types";
import styles from "./AccessControlList.module.css";

export default function AccessControlList() {
    const [employees, setEmployees] = useState<EmployeeListItemResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeListItemResponse | null>(null);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get("/v1/hr/employees");
            setEmployees(res.data.data.content);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleOpenPermissionModal = (employee: EmployeeListItemResponse) => {
        setSelectedEmployee(employee);
        setShowPermissionModal(true);
    };

    const handleClosePermissionModal = () => {
        setSelectedEmployee(null);
        setShowPermissionModal(false);
    };

    const columns: TableColumn<EmployeeListItemResponse>[] = [
        {
            key: "stt",
            title: "STT",
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            key: "employeeCode",
            title: "Mã NV",
        },
        {
            key: "fullName",
            title: "Họ tên",
        },
        {
            key: "email",
            title: "Email",
        },
        {
            key: "status",
            title: "Trạng thái",
        },
        {
            key: "actions",
            title: "Thao tác",
            width: 140,
            render: (_, row) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenPermissionModal(row)}
                >
                    Sửa quyền
                </Button>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    data={employees}
                    rowKey="id"
                    isLoading={loading}
                />
            </div>

            {showPermissionModal && selectedEmployee && (
                <PermissionForm
                    isOpen={showPermissionModal}
                    onClose={handleClosePermissionModal}
                    employee={selectedEmployee}
                />
            )}
        </div>
    );
}
