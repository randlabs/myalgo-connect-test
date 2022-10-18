import { Container } from 'reactstrap';
import { SignatureMethod } from '../../context/appContext';
import "../operations/all.scss";
import GenericDropDown from './Dropdown';

interface SignatureMethodSelectorProps {
    value: SignatureMethod;
    onChange: (method: SignatureMethod) => void;
}

export default function SignatureMethodSelector(props: SignatureMethodSelectorProps): JSX.Element {
    return (
        <Container>
            <div style={{ display: 'flex', flexDirection: 'row', flex: 1, alignItems: 'center', marginTop: '1rem' }}>
                <span>
                    Signature Method
                </span>
                <div style={{ marginLeft: '10px', width: '100px' }}>
                    <GenericDropDown
                        selectedValue={props.value}
                        values={['legacy', 'arc-0001']}
                        onChange={props.onChange}
                    />
                </div>
            </div>
        </Container>
    );
};
