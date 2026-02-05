'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useState, useCallback } from 'react';
import {
    INSERT_TABLE_COMMAND,
    TableNode,
    TableRowNode,
    TableCellNode,
    $isTableSelection,
    $isTableCellNode,
    $getTableCellNodeFromLexicalNode,
    $deleteTableColumn__EXPERIMENTAL,
    $deleteTableRow__EXPERIMENTAL,
    $insertTableColumn__EXPERIMENTAL,
    $insertTableRow__EXPERIMENTAL,
} from '@lexical/table';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW } from 'lexical';
import { useEffect } from 'react';

// Register table nodes
export { TableNode, TableRowNode, TableCellNode };

export default function TablePlugin() {
    const [editor] = useLexicalComposerContext();
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [rows, setRows] = useState('3');
    const [columns, setColumns] = useState('3');
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

    const insertTable = useCallback(() => {
        const rowCount = parseInt(rows) || 3;
        const colCount = parseInt(columns) || 3;

        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            rows: String(Math.min(Math.max(rowCount, 1), 20)),
            columns: String(Math.min(Math.max(colCount, 1), 10)),
        });

        setShowInsertModal(false);
        setRows('3');
        setColumns('3');
    }, [editor, rows, columns]);

    // Context menu for table operations
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            editor.getEditorState().read(() => {
                const selection = $getSelection();

                if ($isTableSelection(selection) || $isRangeSelection(selection)) {
                    const node = selection?.getNodes()[0];
                    if (node) {
                        const tableCell = $getTableCellNodeFromLexicalNode(node);
                        if (tableCell) {
                            e.preventDefault();
                            setContextMenuPosition({ x: e.clientX, y: e.clientY });
                            setShowContextMenu(true);
                        }
                    }
                }
            });
        };

        const handleClick = () => {
            setShowContextMenu(false);
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('click', handleClick);
        };
    }, [editor]);

    const handleTableAction = (action: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if (!selection) return;

            const node = selection.getNodes()[0];
            if (!node) return;

            const tableCell = $getTableCellNodeFromLexicalNode(node);
            if (!$isTableCellNode(tableCell)) return;

            switch (action) {
                case 'insertRowAbove':
                    $insertTableRow__EXPERIMENTAL(false);
                    break;
                case 'insertRowBelow':
                    $insertTableRow__EXPERIMENTAL(true);
                    break;
                case 'insertColumnLeft':
                    $insertTableColumn__EXPERIMENTAL(false);
                    break;
                case 'insertColumnRight':
                    $insertTableColumn__EXPERIMENTAL(true);
                    break;
                case 'deleteRow':
                    $deleteTableRow__EXPERIMENTAL();
                    break;
                case 'deleteColumn':
                    $deleteTableColumn__EXPERIMENTAL();
                    break;
            }
        });
        setShowContextMenu(false);
    };

    return (
        <>
            {/* Insert Table Button */}
            <button
                onClick={() => setShowInsertModal(true)}
                className="p-2 hover:bg-accent rounded"
                type="button"
                aria-label="Insert Table"
                title="টেবিল যোগ করুন"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </button>

            {/* Insert Table Modal */}
            {showInsertModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">টেবিল যোগ করুন</h3>
                            <button
                                onClick={() => setShowInsertModal(false)}
                                className="text-muted-foreground hover:text-foreground text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">সারি (Rows)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={rows}
                                    onChange={(e) => setRows(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">কলাম (Columns)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={columns}
                                    onChange={(e) => setColumns(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowInsertModal(false)}
                                className="px-4 py-2 text-sm rounded-lg hover:bg-muted"
                            >
                                বাতিল
                            </button>
                            <button
                                onClick={insertTable}
                                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                            >
                                যোগ করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Context Menu */}
            {showContextMenu && (
                <div
                    className="fixed bg-card border rounded-lg shadow-xl py-2 z-50 min-w-[180px]"
                    style={{
                        left: contextMenuPosition.x,
                        top: contextMenuPosition.y,
                    }}
                >
                    <button
                        onClick={() => handleTableAction('insertRowAbove')}
                        className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                    >
                        ↑ উপরে সারি যোগ করুন
                    </button>
                    <button
                        onClick={() => handleTableAction('insertRowBelow')}
                        className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                    >
                        ↓ নিচে সারি যোগ করুন
                    </button>
                    <button
                        onClick={() => handleTableAction('insertColumnLeft')}
                        className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                    >
                        ← বামে কলাম যোগ করুন
                    </button>
                    <button
                        onClick={() => handleTableAction('insertColumnRight')}
                        className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                    >
                        → ডানে কলাম যোগ করুন
                    </button>
                    <div className="h-px bg-border my-1" />
                    <button
                        onClick={() => handleTableAction('deleteRow')}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 text-sm"
                    >
                        ✕ সারি মুছুন
                    </button>
                    <button
                        onClick={() => handleTableAction('deleteColumn')}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 text-sm"
                    >
                        ✕ কলাম মুছুন
                    </button>
                </div>
            )}
        </>
    );
}
