import { useRef, useState } from 'react';
import { Group, Text, Rect } from 'react-konva';
import Konva from 'konva';
import type { Annotation, GardenAction } from '../../types';

interface AnnotationNodeProps {
  annotation: Annotation;
  dispatch: React.Dispatch<GardenAction>;
}

export function AnnotationNode({ annotation, dispatch }: AnnotationNodeProps) {
  const textRef = useRef<Konva.Text>(null);
  const [editing, setEditing] = useState(false);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    dispatch({
      type: 'MOVE_ANNOTATION',
      payload: { id: annotation.id, x: e.target.x(), y: e.target.y() },
    });
  };

  const handleDblClick = () => {
    const textNode = textRef.current;
    if (!textNode) return;

    setEditing(true);

    const stage = textNode.getStage();
    if (!stage) return;

    const stageBox = stage.container().getBoundingClientRect();
    const absPos = textNode.getAbsolutePosition();
    const scale = stage.scaleX();

    const textarea = document.createElement('textarea');
    textarea.value = annotation.text;
    textarea.style.position = 'absolute';
    textarea.style.left = `${stageBox.left + absPos.x * scale + stage.x()}px`;
    textarea.style.top = `${stageBox.top + absPos.y * scale + stage.y()}px`;
    textarea.style.width = `${Math.max(150, textNode.width() * scale)}px`;
    textarea.style.fontSize = `${annotation.fontSize * scale}px`;
    textarea.style.fontFamily = 'sans-serif';
    textarea.style.color = annotation.color;
    textarea.style.border = '2px solid #3498db';
    textarea.style.borderRadius = '4px';
    textarea.style.padding = '4px';
    textarea.style.margin = '0';
    textarea.style.background = 'rgba(255,255,255,0.95)';
    textarea.style.outline = 'none';
    textarea.style.resize = 'both';
    textarea.style.zIndex = '1000';
    textarea.style.lineHeight = '1.3';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const finish = () => {
      const newText = textarea.value.trim();
      if (newText) {
        dispatch({ type: 'EDIT_ANNOTATION', payload: { id: annotation.id, text: newText } });
      } else {
        dispatch({ type: 'DELETE_ANNOTATION', payload: { id: annotation.id } });
      }
      document.body.removeChild(textarea);
      setEditing(false);
    };

    textarea.addEventListener('blur', finish);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        textarea.removeEventListener('blur', finish);
        document.body.removeChild(textarea);
        setEditing(false);
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        textarea.blur();
      }
    });
  };

  return (
    <Group
      x={annotation.x}
      y={annotation.y}
      draggable
      onDragEnd={handleDragEnd}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
    >
      <Rect
        width={textRef.current?.width() ?? 60}
        height={textRef.current?.height() ?? 20}
        fill="rgba(255,255,255,0.7)"
        cornerRadius={3}
        listening={false}
      />
      <Text
        ref={textRef}
        text={annotation.text}
        fontSize={annotation.fontSize}
        fill={editing ? 'transparent' : annotation.color}
        fontFamily="sans-serif"
        padding={4}
      />
    </Group>
  );
}
