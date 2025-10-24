import React, { useState, useRef, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SharedFile, Employee, Folder } from '../types';
import { UploadCloudIcon, FileIcon, ImageIcon, FileTextIcon, MoreVerticalIcon, DownloadIcon, TrashIcon, FolderIcon, FolderPlusIcon, ChevronRightIcon } from '../components/icons';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import Modal from '../components/Modal';

interface ShareFolderPageProps {
    currentUser: Employee;
    employees: Employee[];
}

const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFileIcon = (fileType: string): React.ReactNode => {
    if (fileType.startsWith('image/')) {
        return <ImageIcon className="w-8 h-8 text-blue-500" />;
    }
    if (fileType === 'application/pdf' || fileType.startsWith('text/')) {
        return <FileTextIcon className="w-8 h-8 text-green-500" />;
    }
    return <FileIcon className="w-8 h-8 text-slate-500" />;
};

const FileCard: React.FC<{
    file: SharedFile,
    uploaderName: string,
    onDelete: (fileId: string) => void
}> = ({ file, uploaderName, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = file.dataUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsMenuOpen(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col p-4">
            <div className="flex items-center gap-4 mb-3">
                {getFileIcon(file.type)}
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-slate-800 dark:text-white truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatBytes(file.size)}</p>
                </div>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <MoreVerticalIcon className="w-5 h-5 text-slate-500 dark:text-slate-400"/>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-850 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownload(); }} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <DownloadIcon className="w-4 h-4 mr-2" /> Download
                                </a>
                                <a href="#" onClick={(e) => { e.preventDefault(); onDelete(file.id); setIsMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <TrashIcon className="w-4 h-4 mr-2" /> Delete
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                <span>By: {uploaderName}</span>
                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
            </div>
        </div>
    )
}

const FolderCard: React.FC<{
    folder: Folder,
    onOpen: (folderId: string) => void,
    onDelete: (folder: Folder) => void,
}> = ({ folder, onOpen, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col p-4">
            <div className="flex items-start gap-4 flex-1">
                <div 
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => onOpen(folder.id)}
                    onDoubleClick={() => onOpen(folder.id)}
                >
                    <FolderIcon className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-slate-800 dark:text-white break-words" title={folder.name}>{folder.name}</p>
                    </div>
                </div>
                <div className="relative" ref={menuRef}>
                     <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <MoreVerticalIcon className="w-5 h-5 text-slate-500 dark:text-slate-400"/>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-850 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                                <a href="#" onClick={(e) => { e.preventDefault(); onDelete(folder); setIsMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <TrashIcon className="w-4 h-4 mr-2" /> Delete
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                <span>Folder</span>
                <span>{new Date(folder.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

const ShareFolderPage: React.FC<ShareFolderPageProps> = ({ currentUser, employees }) => {
    const [folders, setFolders] = useLocalStorage<Folder[]>('taskflow-folders', []);
    const [files, setFiles] = useLocalStorage<SharedFile[]>('taskflow-files', []);
    
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
    
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const path = useMemo(() => {
        const buildPath = (folderId: string | null): Array<{id: string | null, name: string}> => {
            if (folderId === null) {
                return [{ id: null, name: 'ShareFolder' }];
            }
            const currentFolder = folders.find(f => f.id === folderId);
            if (!currentFolder) {
                return [{ id: null, name: 'ShareFolder' }]; // Fallback if folder not found
            }
            return [...buildPath(currentFolder.parentId), { id: currentFolder.id, name: currentFolder.name }];
        };
        return buildPath(currentFolderId);
    }, [currentFolderId, folders]);

    const handleCreateFolder = (name: string) => {
        if (!name.trim()) return;
        const newFolder: Folder = {
            id: `folder-${Date.now()}-${Math.random()}`,
            name: name.trim(),
            parentId: currentFolderId,
            createdAt: new Date().toISOString(),
        };
        setFolders(prev => [...prev, newFolder]);
        setIsNewFolderModalOpen(false);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles) return;

        Array.from(selectedFiles).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newFile: SharedFile = {
                    id: `file-${Date.now()}-${Math.random()}`,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    dataUrl: e.target?.result as string,
                    uploadedAt: new Date().toISOString(),
                    uploaderId: currentUser.id,
                    folderId: currentFolderId,
                };
                setFiles(prev => [...prev, newFile]);
            };
            reader.readAsDataURL(file);
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteFile = () => {
        if (fileToDelete) {
            setFiles(files.filter(f => f.id !== fileToDelete));
            setFileToDelete(null);
        }
    };

    const handleDeleteFolder = () => {
        if (!folderToDelete) return;

        const folderIdsToDelete = new Set<string>();
        const fileIdsToDelete = new Set<string>();

        const collectItemsToDelete = (folderId: string) => {
            folderIdsToDelete.add(folderId);
            files.forEach(file => {
                if (file.folderId === folderId) {
                    fileIdsToDelete.add(file.id);
                }
            });
            folders.forEach(folder => {
                if (folder.parentId === folderId) {
                    collectItemsToDelete(folder.id);
                }
            });
        };

        collectItemsToDelete(folderToDelete.id);

        setFolders(prev => prev.filter(f => !folderIdsToDelete.has(f.id)));
        setFiles(prev => prev.filter(f => !fileIdsToDelete.has(f.id)));
        
        setFolderToDelete(null);
    };
    
    const displayedFolders = useMemo(() => {
        return folders.filter(f => f.parentId === currentFolderId)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [folders, currentFolderId]);

    const displayedFiles = useMemo(() => {
        return files.filter(f => (f.folderId || null) === currentFolderId)
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }, [files, currentFolderId]);

    const NewFolderModal: React.FC<{ isOpen: boolean, onClose: () => void, onCreate: (name: string) => void }> = ({ isOpen, onClose, onCreate }) => {
        const [name, setName] = useState('');
        const inputRef = useRef<HTMLInputElement>(null);

        React.useEffect(() => {
            if (isOpen) {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }, [isOpen]);
    
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onCreate(name);
            setName('');
        };
    
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Create New Folder">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="folder-name" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Folder Name</label>
                        <input
                            type="text"
                            id="folder-name"
                            ref={inputRef}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-800">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-800">Create</button>
                    </div>
                </form>
            </Modal>
        );
    };

    const Breadcrumbs: React.FC<{ path: Array<{id: string | null, name: string}>, onNavigate: (id: string | null) => void }> = ({ path, onNavigate }) => (
        <nav className="flex" aria-label="Breadcrumb">
          <ol role="list" className="flex items-center space-x-1 sm:space-x-2">
            {path.map((p, index) => (
              <li key={p.id || 'root'}>
                <div className="flex items-center">
                  {index > 0 && (
                    <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  )}
                  <button
                    onClick={() => onNavigate(p.id)}
                    className={`ml-1 sm:ml-2 text-sm font-medium ${index === path.length - 1 ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    aria-current={index === path.length - 1 ? 'page' : undefined}
                  >
                    {p.name}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      );
    
    return (
        <>
            <header className="bg-slate-100/80 dark:bg-slate-850/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm flex-shrink-0">
                <div className="px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="text-xl font-bold text-slate-900 dark:text-white">
                             <Breadcrumbs path={path} onNavigate={setCurrentFolderId} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setIsNewFolderModalOpen(true)}
                                className="flex items-center space-x-2 px-3 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <FolderPlusIcon className="h-5 w-5" />
                                <span className="hidden sm:inline">New Folder</span>
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center space-x-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <UploadCloudIcon className="h-5 w-5" />
                                <span className="hidden sm:inline">Upload</span>
                            </button>
                        </div>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-y-auto">
                {displayedFolders.length === 0 && displayedFiles.length === 0 ? (
                    <EmptyState 
                        message={currentFolderId ? "This folder is empty" : "No files or folders have been shared yet"}
                        actionText="Upload a File"
                        onActionClick={() => fileInputRef.current?.click()}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {displayedFolders.map(folder => (
                            <FolderCard
                                key={folder.id}
                                folder={folder}
                                onOpen={setCurrentFolderId}
                                onDelete={setFolderToDelete}
                            />
                        ))}
                        {displayedFiles.map(file => {
                            const uploader = employees.find(e => e.id === file.uploaderId);
                            return (
                                <FileCard 
                                    key={file.id} 
                                    file={file} 
                                    uploaderName={uploader?.name || 'Unknown'}
                                    onDelete={setFileToDelete}
                                />
                            );
                        })}
                    </div>
                )}
            </main>
            
            <NewFolderModal 
                isOpen={isNewFolderModalOpen}
                onClose={() => setIsNewFolderModalOpen(false)}
                onCreate={handleCreateFolder}
            />

            {(fileToDelete || folderToDelete) && (
                 <ConfirmationModal
                    isOpen={!!(fileToDelete || folderToDelete)}
                    onClose={() => { setFileToDelete(null); setFolderToDelete(null); }}
                    onConfirm={fileToDelete ? handleDeleteFile : handleDeleteFolder}
                    title={fileToDelete ? "Delete File" : "Delete Folder"}
                    message={
                        fileToDelete 
                        ? "Are you sure you want to delete this file? This action cannot be undone."
                        : `Are you sure you want to delete the folder "${folderToDelete?.name}"? All of its contents (files and subfolders) will be permanently deleted. This action cannot be undone.`
                    }
                />
            )}
        </>
    );
};

export default ShareFolderPage;