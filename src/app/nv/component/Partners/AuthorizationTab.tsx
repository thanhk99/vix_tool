import { AuthorizationItem } from "@/types/funding.types";
import styles from "./AuthorizationTab.module.css";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api/client";
import Modal from "@/components/shared/Modal/Modal";

interface AuthorizationItemProps {
    partnerId: string;
    isReadOnly?: boolean;
}

export default function AuthorizationTab({ partnerId, isReadOnly = false }: AuthorizationItemProps) {
    const [author, setAuthor] = useState<AuthorizationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedAuth, setSelectedAuth] = useState<AuthorizationItem | null>(null);
    const [formData, setFormData] = useState<Partial<AuthorizationItem>>({});
    const [loadingSave, setLoadingSave] = useState(false);

    const fetchDataAuthor = async () => {
        try {
            const res = await apiClient.get(`/v1/capital-source/partners/${partnerId}/authorizations`);
            setAuthor(res.data.data || res.data);
        } catch (error: any) {
            console.error(error);
            setError(error.message || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (partnerId) {
            fetchDataAuthor();
        }
    }, [partnerId]);

    // Mở modal
    const handleOpenCreate = () => {
        setModalMode('create');
        setFormData({
            seqId: author.length + 1,
            partnerId: partnerId,
            status: 'Active'
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = () => {
        if (!selectedAuth) {
            alert('Vui lòng chọn một bản ghi để sửa!');
            return;
        }
        if (isReadOnly) return;
        setModalMode('edit');
        setFormData(selectedAuth);
        setIsModalOpen(true);
    };

    const handleOpenView = () => {
        if (!selectedAuth) {
            alert('Vui lòng chọn một bản ghi để xem!');
            return;
        }
        setModalMode('view');
        setFormData(selectedAuth);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedAuth) {
            alert('Vui lòng chọn một bản ghi để xóa!');
            return;
        }
        if (isReadOnly) return;
        if (!confirm(`Bạn có chắc muốn xóa ủy quyền của "${selectedAuth.authName}"?`)) {
            return;
        }

        try {
            await apiClient.delete(`/v1/capital-source/partners/${partnerId}/authorizations/${selectedAuth.id}`);
            alert('Xóa thành công!');
            setSelectedAuth(null);
            fetchDataAuthor();
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra khi xóa!');
        }
    };

    // Xử lý input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Lưu
    const handleSave = async () => {
        if (!formData.authName || !formData.authidNo || !formData.authissueDate ||
            !formData.authedName || !formData.authedIdNo || !formData.authedIssueDate ||
            !formData.issuePlace || !formData.authNo || !formData.effDate || !formData.expiryDate) {
            alert('Vui lòng nhập đầy đủ các trường bắt buộc!');
            return;
        }

        setLoadingSave(true);
        try {
            const submitData = {
                partnerId: partnerId,
                seqId: formData.seqId || author.length + 1,
                authName: formData.authName,
                authPosition: formData.authPosition || '',
                authidNo: formData.authidNo,
                authissueDate: formData.authissueDate,
                authedName: formData.authedName,
                authedIdNo: formData.authedIdNo,
                authedIssueDate: formData.authedIssueDate,
                issuePlace: formData.issuePlace,
                authNo: formData.authNo,
                effDate: formData.effDate,
                authedPosition: formData.authedPosition || '',
                scope: formData.scope || '',
                phone: formData.phone || '',
                email: formData.email || '',
                expiryDate: formData.expiryDate,
                status: formData.status || 'Active'  // ← THÊM
            };

            if (modalMode === 'create') {
                await apiClient.post(`/v1/capital-source/partners/${partnerId}/authorizations`, submitData);
                alert('Thêm mới ủy quyền thành công!');
            } else if (modalMode === 'edit' && selectedAuth) {
                await apiClient.put(`/v1/capital-source/partners/${partnerId}/authorizations/${selectedAuth.id}`, submitData);
                alert('Cập nhật ủy quyền thành công!');
            }

            setIsModalOpen(false);
            setSelectedAuth(null);
            fetchDataAuthor();
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra!');
        } finally {
            setLoadingSave(false);
        }
    };

    // Click dòng
    const handleRowClick = (item: AuthorizationItem) => {
        setSelectedAuth(item);
    };

    if (loading) return <div className={styles.loading}>Đang tải dữ liệu...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <h1>Danh sách ủy quyền/Người đại diện pháp luật</h1>
            </div>

            <div className={styles.header}>
                <button onClick={handleOpenCreate}>Thêm mới</button>
                <button onClick={handleOpenEdit} disabled={!selectedAuth || isReadOnly}>Sửa</button>
                <button onClick={handleDelete} disabled={!selectedAuth || isReadOnly}>Xóa</button>
                <button onClick={handleOpenView} disabled={!selectedAuth}>Xem</button>
            </div>

            <div className={styles.table}>
                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên người UQ</th>
                            <th>CCCD người UQ</th>
                            <th>Ngày cấp</th>
                            <th>Nơi cấp</th>
                            <th>Chức vụ người UQ</th>
                            <th>Tên người được UQ</th>
                            <th>CCCD người được UQ</th>
                            <th>Ngày cấp</th>
                            <th>Nơi cấp</th>
                            <th>Số giấy tờ UQ</th>
                            <th>Ngày hiệu lực</th>
                            <th>Ngày hết hạn</th>
                            <th>Chức vụ người được UQ</th>
                            <th>Phạm vi UQ</th>
                            <th>Trạng thái</th>
                            <th>SĐT</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {author.length > 0 ? (
                            author.map((item, index) => (
                                <tr 
                                    key={item.id} 
                                    onClick={() => handleRowClick(item)}
                                    className={selectedAuth?.id === item.id ? styles.selectedRow : ''}
                                >
                                    <td>{index + 1}</td>
                                    <td>{item.authName}</td>
                                    <td>{item.authidNo}</td>
                                    <td>{item.authissueDate}</td>
                                    <td>{item.issuePlace}</td>
                                    <td>{item.authPosition || '---'}</td>
                                    <td>{item.authedName}</td>
                                    <td>{item.authedIdNo}</td>
                                    <td>{item.authedIssueDate}</td>
                                    <td>{item.issuePlace}</td>
                                    <td>{item.authNo}</td>
                                    <td>{item.effDate}</td>
                                    <td>{item.expiryDate}</td>
                                    <td>{item.authedPosition || '---'}</td>
                                    <td>{item.scope || '---'}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${
                                            item.status === 'Active' ? styles.statusActive :
                                            item.status === 'Expired' ? styles.statusExpired :
                                            styles.statusPending
                                        }`}>
                                            {item.status === 'Active' ? 'Hiệu lực' :
                                             item.status === 'Expired' ? 'Hết hạn' :
                                             'Chờ duyệt'}
                                        </span>
                                    </td>
                                    <td>{item.phone || '---'}</td>
                                    <td>{item.email || '---'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={18} className={styles.emptyRow}>
                                    <p>Chưa có dữ liệu ủy quyền</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ===== MODAL ===== */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFormData({});
                }}
                title={
                    modalMode === 'create' ? 'Thêm mới ủy quyền' :
                    modalMode === 'edit' ? 'Chỉnh sửa ủy quyền' :
                    'Thông tin ủy quyền'
                }
                size="lg"
            >
                <div className={styles.modalContent}>
                    {/* Row 1: Tên người UQ + CCCD */}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Tên người UQ <span className={styles.required}>*</span></label>
                            <input
                                name="authName"
                                value={formData.authName || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                                placeholder="Nhập tên người ủy quyền"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>CCCD người UQ <span className={styles.required}>*</span></label>
                            <input
                                name="authidNo"
                                value={formData.authidNo || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                                placeholder="Nhập CCCD"
                            />
                        </div>
                    </div>

                    {/* Row 2: Chức vụ + Ngày cấp */}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Chức vụ người UQ</label>
                            <input
                                name="authPosition"
                                value={formData.authPosition || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                                placeholder="Nhập chức vụ"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Ngày cấp <span className={styles.required}>*</span></label>
                            <input
                                type="date"
                                name="authissueDate"
                                value={formData.authissueDate || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                            />
                        </div>
                    </div>

                    {/* Row 3: Tên người được UQ + CCCD */}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Tên người được UQ <span className={styles.required}>*</span></label>
                            <input
                                name="authedName"
                                value={formData.authedName || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                                placeholder="Nhập tên người được ủy quyền"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>CCCD người được UQ <span className={styles.required}>*</span></label>
                            <input
                                name="authedIdNo"
                                value={formData.authedIdNo || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                                placeholder="Nhập CCCD"
                            />
                        </div>
                    </div>

                    {/* Row 4: Ngày cấp + Nơi cấp */}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Ngày cấp người được UQ <span className={styles.required}>*</span></label>
                            <input
                                type="date"
                                name="authedIssueDate"
                                value={formData.authedIssueDate || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Nơi cấp <span className={styles.required}>*</span></label>
                            <input
                                name="issuePlace"
                                value={formData.issuePlace || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                                placeholder="Nhập nơi cấp"
                            />
                        </div>
                    </div>

                    {/* Row 5: Số giấy tờ + Ngày hiệu lực */}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Số giấy tờ UQ <span className={styles.required}>*</span></label>
                            <input
                                name="authNo"
                                value={formData.authNo || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                                placeholder="Nhập số giấy tờ"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Ngày hiệu lực <span className={styles.required}>*</span></label>
                            <input
                                type="date"
                                name="effDate"
                                value={formData.effDate || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                            />
                        </div>
                    </div>

                    {/* Row 6: Ngày hết hạn + Chức vụ người được UQ */}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Ngày hết hạn <span className={styles.required}>*</span></label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Chức vụ người được UQ</label>
                            <input
                                name="authedPosition"
                                value={formData.authedPosition || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                                placeholder="Nhập chức vụ"
                            />
                        </div>
                    </div>

                    {/* Row 7: Phạm vi UQ + SĐT */}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Phạm vi UQ</label>
                            <textarea
                                name="scope"
                                value={formData.scope || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                                placeholder="Nhập phạm vi ủy quyền"
                                rows={2}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>SĐT</label>
                            <input
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                    </div>

                    {/* Row 8: Email + Trạng thái */}
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                                placeholder="example@domain.com"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Trạng thái</label>
                            <select
                                name="status"
                                value={formData.status || 'Active'}
                                onChange={handleChange}
                                disabled={modalMode === 'view'}
                            >
                                <option value="Active">Hiệu lực</option>
                                <option value="Expired">Hết hạn</option>
                                <option value="Pending">Chờ duyệt</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button 
                        className={styles.cancelBtn} 
                        onClick={() => setIsModalOpen(false)}
                        disabled={loadingSave}
                    >
                        {modalMode === 'view' ? 'Đóng' : 'Hủy'}
                    </button>
                    {modalMode !== 'view' && (
                        <button 
                            className={styles.saveBtn} 
                            onClick={handleSave}
                            disabled={loadingSave || !formData.authName || !formData.authidNo}
                        >
                            {loadingSave ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    )}
                </div>
            </Modal>
        </div>
    );
}