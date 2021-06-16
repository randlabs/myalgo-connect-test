import React, { Fragment, useState, ChangeEvent } from "react";
import { FormGroup, Input, Label } from "reactstrap";

interface NoteProps {
    onChangeNote(note: Uint8Array): void;
}

export default function Note(props: NoteProps): JSX.Element {
    const [ note, setNote ] = useState("");
    
    const onChangeNote = (event: ChangeEvent<HTMLInputElement>): void => {
        setNote(event.target.value);
        props.onChangeNote(new Uint8Array(Buffer.from(event.target.value, "utf8")));
	}

    return <Fragment>
        <FormGroup>
            <Label className="tx-label">
                Note
            </Label>
            <Input
                className="tx-input note"
                type="textarea"
                placeholder="Note"
                value={note}
                onChange={onChangeNote}
            />
        </FormGroup>
    </Fragment>
}