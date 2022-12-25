/* eslint-disable jsx-a11y/alt-text */
import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Gapcursor from "@tiptap/extension-gapcursor";
import Bold from "@tiptap/extension-bold";
import Link from "@tiptap/extension-link";

// icon
import AddColBefore from "./icon/add_col_before.svg";
import AddColAfter from "./icon/add_col_after.svg";
import DeleteCol from "./icon/delete_col.svg";
import ChangeThCol from "./icon/change_th_col.svg";
import AddRowBefore from "./icon/add_row_before.svg";
import AddRowAfter from "./icon/add_row_after.svg";
import DeleteRow from "./icon/delete_row.svg";
import ChangeThRow from "./icon/change_th_row.svg";
import CombineCells from "./icon/combine_cells.svg";
import BoldIcon from "./icon/bold.svg";
import LinkIcon from "./icon/link.svg";
import UnLinkIcon from "./icon/link-unlink.svg";

// CSS
import "./css/Editor.scss";

const microcmsAdminUrl = document.referrer;

export const Editor = () => {
  const [state, setState] = useState({
    iframeId: "",
    defaultMessage: {},
  });

  useEffect(() => {
    window.addEventListener("message", (e) => {
      if (
        e.isTrusted === true &&
        e.data.action === "MICROCMS_GET_DEFAULT_DATA"
      ) {
        setState({
          iframeId: e.data.id,
          defaultMessage: e.data.message,
        });

        window.parent.postMessage(
          {
            id: e.data.id,
            action: "MICROCMS_UPDATE_STYLE",
            message: {
              height: 300,
            },
          },
          microcmsAdminUrl
        );
      }
    });
  }, []);

  const postDataToMicroCMS = (editorContent) => {
    window.parent.postMessage(
      {
        id: state.iframeId,
        action: "MICROCMS_POST_DATA",
        message: {
          data: editorContent,
        },
      },
      microcmsAdminUrl
    );
  };

  const editor = useEditor(
    {
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Gapcursor,
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        Link.configure({
          openOnClick: false,
          linkOnPaste: true,
        }),
      ],
      content: `
        <table>
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
    `,
      onCreate({ editor }) {
        if (Object.keys(state.defaultMessage).length) {
          editor.commands.setContent(state.defaultMessage.data);
        }
      },
      onUpdate({ editor }) {
        postDataToMicroCMS(editor.getHTML());
      },
    },
    [state.defaultMessage]
  );

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="editor">
      <div className="toolbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
          title="太字"
        >
          <img src={BoldIcon} />
        </button>
        <button
          onClick={setLink}
          className={editor.isActive("link") ? "is-active" : ""}
          title="リンク"
        >
          <img src={LinkIcon} />
        </button>
        <button
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          title="リンクを消す"
          style={{ marginRight: "20px" }}
        >
          <img src={UnLinkIcon} />
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          title="右に列を追加"
        >
          <img src={AddColBefore} />
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          title="左に列を追加"
        >
          <img src={AddColAfter} />
        </button>
        <button
          onClick={() => editor.chain().focus().deleteColumn().run()}
          title="列を削除"
        >
          <img src={DeleteCol} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
          title="列を見出しにする"
          style={{ marginRight: "20px" }}
        >
          <img src={ChangeThCol} />
        </button>
        <button
          onClick={() => editor.chain().focus().addRowBefore().run()}
          title="上に行を追加"
        >
          <img src={AddRowBefore} />
        </button>
        <button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          title="下に行を追加"
        >
          <img src={AddRowAfter} />
        </button>
        <button
          onClick={() => editor.chain().focus().deleteRow().run()}
          title="行を削除"
        >
          <img src={DeleteRow} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          title="行を見出しにする"
          style={{ marginRight: "20px" }}
        >
          <img src={ChangeThRow} />
        </button>
        {/* <button
          onClick={() => editor.chain().focus().mergeOrSplit().run()}
          title="セルを結合"
        >
          <img src={CombineCells} />
        </button> */}
      </div>
      <div className="editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
