import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';

interface TransformerWrapperProps {
  selectedBedId: string | null;
  stageRef: React.RefObject<Konva.Stage | null>;
  onTransformEnd: (id: string, width: number, height: number, rotation: number) => void;
}

export function TransformerWrapper({
  selectedBedId,
  stageRef,
  onTransformEnd,
}: TransformerWrapperProps) {
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    if (!selectedBedId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    const node = stage.findOne(`.bed-${selectedBedId}`);
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    } else {
      tr.nodes([]);
    }
  }, [selectedBedId, stageRef]);

  return (
    <Transformer
      ref={trRef}
      rotateEnabled={true}
      keepRatio={false}
      boundBoxFunc={(_oldBox, newBox) => {
        if (newBox.width < 40 || newBox.height < 40) {
          return _oldBox;
        }
        return newBox;
      }}
      onTransformEnd={() => {
        const tr = trRef.current;
        if (!tr || !selectedBedId) return;
        const node = tr.nodes()[0];
        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Find the actual shape inside the group
        const group = node as Konva.Group;
        const children = group.getChildren();
        const shape = children[0]; // First child is Rect or Ellipse

        let newWidth: number;
        let newHeight: number;

        if (shape instanceof Konva.Rect) {
          newWidth = Math.max(40, shape.width() * scaleX);
          newHeight = Math.max(40, shape.height() * scaleY);
        } else {
          // Ellipse - radiusX/Y are half dimensions
          newWidth = Math.max(40, (shape as Konva.Ellipse).radiusX() * 2 * scaleX);
          newHeight = Math.max(40, (shape as Konva.Ellipse).radiusY() * 2 * scaleY);
        }

        const rotation = node.rotation();

        // Reset scale (but keep rotation on node — it's managed by state)
        node.scaleX(1);
        node.scaleY(1);

        onTransformEnd(selectedBedId, newWidth, newHeight, rotation);
      }}
    />
  );
}
