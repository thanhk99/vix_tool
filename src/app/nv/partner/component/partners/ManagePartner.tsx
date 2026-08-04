'use client';

import apiClient from "@/lib/api/client";
import { useEffect, useState } from "react";
import styles from "./ManagePartner.module.css";
import { PartnersItem } from "@/types/funding.types";
import { Check, ChevronLeft, ChevronRight, Eye, Pen, Plus, RefreshCcw, Search, UsersRound, X } from "lucide-react";
import Modal from "@/components/shared/Modal/Modal";
import InformationPartner from "./InformationPartner";
import Link from "next/link";
import PartnerForm from "./PartnerForm";
import { useNotification } from "@/hooks/useNotification";

interface PartnersRespone {
    success: boolean;
    message: string;
    data: PartnersItem[];
}
export default function ManagePartner (){
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [partners, setPartners] = useState<PartnersItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'approve'>('create');
    const [selectedPartner, setSelectPartner] = useState<PartnersItem | null>(null); 
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');         
    const [filteredPartners, setFilteredPartners] = useState<PartnersItem[]>([]); 
    const { notifySuccess, notifyError, notifyWarning, notifyInfo } = useNotification();
    const pageSize = 10; 
    const totalPage = Math.ceil(filteredPartners.length / pageSize);
    const paginatedData = filteredPartners.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Sort out
    const sortPartners = (data: PartnersItem[]) => {
        return[...data].sort((a, b)=>{
             // 1. Chờ duyệt lên đầu
            const isAPending = a.status === 'Pending' || a.status === 'Chờ duyệt';
            const isBPending = b.status === 'Pending' || b.status === 'Chờ duyệt';
            
            if (isAPending && !isBPending) return -1;
            if (!isAPending && isBPending) return 1;
            
            // 2. Tạo gần nhất lên đầu
            const dateA = new Date(a.lastUpdated || 0).getTime();
            const dateB = new Date(b.lastUpdated || 0).getTime();
            return dateB - dateA;
        });
    };

    const fetchPartners = async () => {
        try {
            const res = await apiClient.get<PartnersRespone>('/v1/capital-source/partners');
            const data = res.data.data || res.data;
            const sortData = sortPartners(data);
            setPartners(sortData);
            setFilteredPartners(sortData);
            notifySuccess('Thành công', 'Đã tải danh sách đối tác!');
        } catch (error:any) {
            console.error(error);
            notifyError('Lỗi', error.message || 'Không thể tải danh sách đối tác!'); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    useEffect(() => {
        const keyword = search.toLowerCase();
        if(!keyword) {
            setFilteredPartners(sortPartners(partners));
        }
        else {
            const filtered = partners.filter(item =>
                item.cusId?.toLowerCase().includes(keyword) ||
                item.cusName?.toLowerCase().includes(keyword) ||
                item.branchCusId?.toLowerCase().includes(keyword)
            );
            setFilteredPartners(filtered);
        }
        setCurrentPage(1);
    }, [search, partners]);

    // ===== VERIFY =====
    const validateSelectedPartner = () => {
        if (!selectedPartner) {
            notifyWarning('Cảnh báo', 'Vui lòng chọn một đối tác!');
            return false;
        }
        return true;
    };

    // Open modal
    const handleOpenCreate = () => {
        setModalMode('create');
        setSelectPartner(null);
        setIsModalOpen(true);
    }

    const handleOpenEdit = () => {
        if (!validateSelectedPartner()) return;
        setModalMode('edit');
        setIsModalOpen(true);
    }

    const handleOpenView = () => {
        if (!validateSelectedPartner()) return;
        setModalMode('view');
        setIsModalOpen(true);
    }

    const handleOpenApprove =() => {
        if (!validateSelectedPartner()) return;
        if (selectedPartner?.status !== 'Pending' && selectedPartner?.status !== 'Chờ duyệt') {
            notifyWarning('Cảnh báo', 'Chỉ có thể duyệt đối tác ở trạng thái "Chờ duyệt"!');  
            return;
        }
        setModalMode('approve');
        setIsModalOpen(true);
    }

    // Save Success
    const handleSave = async () => {
        await fetchPartners();
        setIsModalOpen(false);
        notifySuccess('Thành công', 'Đã cập nhật danh sách đối tác!');
    }

    // Click Row
    const handleRowClick = (partner: PartnersItem) => {
        setSelectPartner(partner);
    }

    const handleRefresh = () => {
        fetchPartners();
        setSelectPartner(null);
        setSearch('');
        notifySuccess('Làm mới', 'Đã cập nhật danh sách đối tác!');
    };

    if(loading) {
        return (
            <div className={styles.loading}>
                <p>Đang tải dữ liệu...</p>
            </div>
        )
    }
    else if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
            </div>
        )
    }
    
    return (
        <div className={styles.container}>
            {/*Title */}
            <div className={styles.title}>
                <UsersRound/>
                <h1>Quản lý đối tác</h1>
            </div>
            {/*Action */}
            <div className={styles.headerActions}>
                <div className={styles.itemAction} onClick={handleOpenCreate} >
                    <Plus/>
                    <button>Thêm mới</button>
                </div>
                <div className={`${styles.itemAction} ${!selectedPartner ? styles.disabled : ''}`} 
                    onClick={handleOpenEdit}>
                    <Pen/>
                    <button>Sửa</button>
                </div>

                <div className={`${styles.itemAction} ${!selectedPartner ? styles.disabled : ''}`} 
                    onClick={handleOpenView}>
                    <Eye/>
                    <button>Xem</button>
                </div>

                <div className={`${styles.itemAction} ${!selectedPartner || selectedPartner.status !== 'Chờ duyệt' ? styles.disabled : ''}`} 
                    onClick={handleOpenApprove}>
                    <Check/>
                    <button>Duyệt</button>
                </div>
                <div className={styles.searchWrapper}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Tìm kiếm theo mã, tên..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className={styles.clearBtn} onClick={() => setSearch('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* ===== REFRESH ===== */}
                <button className={styles.refreshBtn} onClick={handleRefresh} title="Làm mới">
                    <RefreshCcw size={16} />
                </button>

            </div>
            {/*Table */}
            <div className={styles.table}>
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã KH</th>
                            <th>Mã đơn vị GD</th>
                            <th>Tên KH</th>
                            <th>Số ĐKKD/CCCD</th>
                            <th>Ngày cấp lần đầu</th>
                            <th>Ngày cấp cuối</th>
                            <th>Nơi cấp</th>
                            <th>GP hoạt động</th>
                            <th>Ngày cấp</th>
                            <th>Trạng thái</th>
                            <th>Ngày chỉnh sửa</th>
                            <th>User thực hiện</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((partner, index) => (
                            <tr key={partner.id} onClick={() => handleRowClick(partner)} 
                            className={
                                selectedPartner?.id === partner.id
                                    ? styles.selectedRow
                                    : ""
                            }>
                                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                <td className={styles.cusId}>{partner.cusId}</td>
                                <td>{partner.branchCusId}</td>
                                <td className={styles.cusName}>{partner.cusName}</td>
                                <td>{partner.idCode}</td>
                                <td>{partner.fistIssueDate}</td>
                                <td>{partner.lastIssueDate}</td>
                                <td>{partner.issueBy}</td>
                                <td>{partner.opLiscenseNo}</td>
                                <td>{partner.opIssueDate}</td>
                                <td>
                                    <span
                                        className={`${styles.statusBadge} ${
                                            partner.status === 'Active' || partner.status === 'Đã duyệt'
                                                ? styles.statusApproved
                                                : partner.status === 'Pending' || partner.status === 'Chờ duyệt'
                                                ? styles.statusPending
                                                : styles.statusInactive
                                        }`}
                                    >
                                        {partner.status === 'Active' ? 'Đã duyệt' 
                                            : partner.status === 'Pending' ? 'Chờ duyệt' 
                                            : partner.status === 'Đã duyệt' ? 'Đã duyệt'
                                            : partner.status === 'Chờ duyệt' ? 'Chờ duyệt'
                                            : partner.status}
                                    </span>
                                </td>
                                <td>{partner.lastUpdated}</td>
                                <td>{partner.updatedBy}</td>
                                <td className={styles.tableActions}>
                                    <Link href={`/nv/partner/view/${partner.id}`}>
                                        <Eye size={14}/>
                                    </Link>/
                                    <Link href={`/nv/partner/edit/${partner.id}`}>
                                        <Pen size={14}/>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            {filteredPartners.length > 0 && (
                <div className={styles.pagination}>
                <div className={styles.pageInfo}>
                    {filteredPartners.length} bản ghi
                </div>
                <div className={styles.pageControls}>
                    <button
                    className={styles.pageBtn}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    >
                    <ChevronLeft/>
                    </button>
                    {Array.from({ length: Math.min(totalPage, 10) }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        className={`${styles.pageBtn} ${currentPage === page ? styles.pageActive : ''}`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </button>
                    ))}
                    <button
                    className={styles.pageBtn}
                    disabled={currentPage === totalPage}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    >
                    <ChevronRight/>
                    </button>
                </div>
                </div>
            )}

            {/*Detail partner */}
            {selectedPartner && (
                <InformationPartner partner={selectedPartner}
                onClose = {() => setSelectPartner(null)} />
            )}

            {/* Modal */}
           <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    modalMode === "create"
                        ? "Thêm mới đối tác"
                        : modalMode === "edit"
                        ? "Chỉnh sửa đối tác"
                        : modalMode === "view"
                        ? "Thông tin đối tác"
                        : "Duyệt đối tác"
                }
                size="xl"
            >
                <PartnerForm
                    mode={modalMode}
                    partner={selectedPartner}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSave}
                />
            </Modal>
        </div>
    )
}