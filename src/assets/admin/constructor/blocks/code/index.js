import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';

import CodeEditor from '../../../components/code-editor';
import './editor.scss';

const {
    __,
    sprintf,
} = wp.i18n;

const {
    Fragment,
    Component,
} = wp.element;

const {
    withSelect,
    select,
} = wp.data;

const {
    PanelBody,
    BaseControl,
    SelectControl,
    ToggleControl,
    RadioControl,
    Button,
    TabPanel,
    Notice,
} = wp.components;

// Add autocompleter with control names.
addCompleter( {
    getCompletions( editor, session, pos, prefix, callback ) {
        if ( 'lzb-editor-php' === editor.id ) {
            const {
                getBlockData,
            } = select( 'lazy-blocks/block-data' );

            const blockData = getBlockData();

            if ( blockData.controls ) {
                const result = [];

                Object.keys( blockData.controls ).forEach( ( k ) => {
                    const control = blockData.controls[ k ];

                    if ( control.name && ! control.child_of ) {
                        result.push( {
                            caption: `$attributes['${ control.name }']`,
                            value: `$attributes['${ control.name }']`,
                            meta: sprintf( __( 'Control "%1$s"', '@@text_domain' ), control.label ),
                        } );
                    }
                } );

                if ( result.length ) {
                    callback( null, result );
                }
            }
        }
    },
    identifierRegexps: [ /\$/ ],
} );
addCompleter( {
    getCompletions( editor, session, pos, prefix, callback ) {
        if ( 'lzb-editor-html' === editor.id ) {
            const {
                getBlockData,
            } = select( 'lazy-blocks/block-data' );

            const blockData = getBlockData();

            if ( blockData.controls ) {
                const result = [];

                Object.keys( blockData.controls ).forEach( ( k ) => {
                    const control = blockData.controls[ k ];

                    if ( control.name && ! control.child_of ) {
                        result.push( {
                            caption: `{{${ control.name }}}`,
                            value: `{{${ control.name }}}`,
                            meta: sprintf( __( 'Control "%1$s"', '@@text_domain' ), control.label ),
                        } );
                    }
                } );

                if ( result.length ) {
                    callback( null, result );
                }
            }
        }
    },
    identifierRegexps: [ /\{/ ],
} );

class CustomCodeSettings extends Component {
    constructor( ...args ) {
        super( ...args );

        this.state = {
            showInfo: false,
            tab: 'frontend',
        };

        this.getEditor = this.getEditor.bind( this );
    }

    getEditor( name = 'frontend' ) {
        const {
            data,
            updateData,
        } = this.props;

        const metaName = `code_${ name }_html`;

        return (
            <CodeEditor
                key={ metaName + data.code_output_method }
                mode={ data.code_output_method }
                onChange={ ( value ) => updateData( { [ metaName ]: value } ) }
                value={ data[ metaName ] }
                maxLines={ 20 }
                minLines={ 5 }
                height="300px"
                editorProps={ {
                    id: `lzb-editor-${ data.code_output_method }`,
                } }
            />
        );
    }

    render() {
        const {
            data,
            updateData,
            currentTheme,
            onTabChange,
        } = this.props;

        const {
            showInfo,
        } = this.state;

        let {
            tab,
        } = this.state;

        // add ajax check for filter
        //
        // has_filter( $block_slug . '/frontend_callback' )
        //
        // and print
        // sprintf( __( 'For block output used filter: %s', '@@text_domain' ), '<code>' . $block_slug . '/frontend_callback</code>' )
        //
        //
        // has_filter( $block_slug . '/editor_callback' )
        //
        // and print
        // sprintf( __( 'For block output used filter: %s', '@@text_domain' ), '<code>' . $block_slug . '/editor_callback</code>' )

        const tabs = [ {
            name: 'frontend',
            title: __( 'Frontend', '@@text_domain' ),
            className: 'lazyblocks-control-tabs-tab',
        } ];

        if ( 'never' !== data.code_show_preview && ! data.code_single_output ) {
            tabs.push( {
                name: 'editor',
                title: __( 'Editor', '@@text_domain' ),
                className: 'lazyblocks-control-tabs-tab',
            } );
        } else {
            tab = 'frontend';
        }

        return (
            <Fragment>
                <div className="lzb-constructor-custom-code-settings">
                    <PanelBody>
                        <h2>{ __( 'Code', '@@text_domain' ) }</h2>
                    </PanelBody>
                    <PanelBody>
                        <BaseControl
                            label={ __( 'Output Method', '@@text_domain' ) }
                        >
                            <RadioControl
                                options={ [
                                    {
                                        label: __( 'HTML + Handlebars', '@@text_domain' ),
                                        value: 'html',
                                    }, {
                                        label: __( 'PHP', '@@text_domain' ),
                                        value: 'php',
                                    }, {
                                        label: __( 'Theme Template', '@@text_domain' ),
                                        value: 'template',
                                    },
                                ] }
                                selected={ data.code_output_method || 'html' }
                                onChange={ ( value ) => updateData( { code_output_method: value } ) }
                            />
                        </BaseControl>
                    </PanelBody>

                    { /* Code Editor */ }
                    { 'template' !== data.code_output_method ? (
                        <Fragment>
                            <PanelBody>
                                <BaseControl>
                                    { 1 < tabs.length ? (
                                        <TabPanel
                                            className="lazyblocks-control-tabs"
                                            activeClass="is-active"
                                            tabs={ tabs }
                                            onSelect={ ( value ) => this.setState( { tab: value }, () => onTabChange && onTabChange( value ) ) }
                                        >
                                            { () => null }

                                        </TabPanel>
                                    ) : null }
                                    { this.getEditor( tab ) }
                                </BaseControl>
                                <BaseControl>
                                    { ! showInfo ? (
                                        <Button
                                            isLink
                                            onClick={ () => {
                                                this.setState( { showInfo: true } );
                                            } }
                                        >
                                            { __( 'How to use?', '@@text_domain' ) }
                                        </Button>
                                    ) : (
                                        <Notice
                                            status="info"
                                            isDismissible={ false }
                                            className="lzb-constructor-notice"
                                        >
                                            <p className="description">
                                                { __( 'Simple text field example see here:', '@@text_domain' ) }
                                                { ' ' }
                                                <a href="https://lazyblocks.com/documentation/blocks-controls/text/?utm_source=plugin&utm_medium=constructor&utm_campaign=how_to_use_control&utm_content=@@plugin_version" target="_blank" rel="noopener noreferrer">https://lazyblocks.com/documentation/blocks-controls/text/</a>
                                            </p>
                                            <hr />
                                            <p className="description">
                                                { __( 'Note 1: if you use blocks as Metaboxes, you may leave this code editor blank.', '@@text_domain' ) }
                                            </p>
                                            <p className="description">
                                                { __( 'Note 2: supported custom PHP callback to output block', '@@text_domain' ) }
                                                { ' ' }
                                                <a href="https://lazyblocks.com/documentation/blocks-code/php-callback/?utm_source=plugin&utm_medium=constructor&utm_campaign=how_to_use_php_callback&utm_content=@@plugin_version" target="_blank" rel="noopener noreferrer">https://lazyblocks.com/documentation/blocks-code/php-callback/</a>
                                                .
                                            </p>
                                        </Notice>
                                    ) }
                                </BaseControl>
                            </PanelBody>

                            <PanelBody>
                                <BaseControl>
                                    <ToggleControl
                                        label={ __( 'Single output code for Frontend and Editor', '@@text_domain' ) }
                                        checked={ data.code_single_output }
                                        onChange={ ( value ) => updateData( { code_single_output: value } ) }
                                    />
                                </BaseControl>
                            </PanelBody>
                        </Fragment>
                    ) : '' }

                    { /* Information about Theme Template usage */ }
                    { 'template' === data.code_output_method && currentTheme && currentTheme.stylesheet ? (
                        <PanelBody>
                            <Notice
                                status="info"
                                isDismissible={ false }
                                className="lzb-constructor-notice lzb-constructor-notice-theme-template"
                            >
                                <p className="description">
                                    { __( 'To output block code, Lazy Blocks will look for template file in your theme directory:', '@@text_domain' ) }
                                </p>
                                <code>
                                    { `/wp-content/themes/${ currentTheme.stylesheet }/blocks/` }
                                    <span>
                                        { `lazyblock-${ data.slug }` }
                                    </span>
                                    /block.php
                                </code>
                                <p className="description">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M8.26686 5.45486C8.91012 5.4035 9.52077 5.15049 10.0119 4.73186C10.5665 4.25945 11.2713 4 11.9999 4C12.7284 4 13.4332 4.25945 13.9879 4.73186C14.4789 5.15049 15.0896 5.4035 15.7329 5.45486C16.4593 5.51292 17.1413 5.82782 17.6566 6.34313C18.1719 6.85843 18.4868 7.54043 18.5449 8.26686C18.5959 8.90986 18.8489 9.52086 19.2679 10.0119C19.7403 10.5665 19.9997 11.2713 19.9997 11.9999C19.9997 12.7284 19.7403 13.4332 19.2679 13.9879C18.8492 14.4789 18.5962 15.0896 18.5449 15.7329C18.4868 16.4593 18.1719 17.1413 17.6566 17.6566C17.1413 18.1719 16.4593 18.4868 15.7329 18.5449C15.0896 18.5962 14.4789 18.8492 13.9879 19.2679C13.4332 19.7403 12.7284 19.9997 11.9999 19.9997C11.2713 19.9997 10.5665 19.7403 10.0119 19.2679C9.52077 18.8492 8.91012 18.5962 8.26686 18.5449C7.54043 18.4868 6.85843 18.1719 6.34313 17.6566C5.82782 17.1413 5.51292 16.4593 5.45486 15.7329C5.4035 15.0896 5.15049 14.4789 4.73186 13.9879C4.25945 13.4332 4 12.7284 4 11.9999C4 11.2713 4.25945 10.5665 4.73186 10.0119C5.15049 9.52077 5.4035 8.91012 5.45486 8.26686C5.51292 7.54043 5.82782 6.85843 6.34313 6.34313C6.85843 5.82782 7.54043 5.51292 8.26686 5.45486V5.45486ZM15.7069 10.7069C15.889 10.5183 15.9898 10.2657 15.9875 10.0035C15.9853 9.74126 15.8801 9.49045 15.6947 9.30504C15.5093 9.11963 15.2585 9.01446 14.9963 9.01219C14.7341 9.00991 14.4815 9.1107 14.2929 9.29286L10.9999 12.5859L9.70686 11.2929C9.51826 11.1107 9.26565 11.0099 9.00346 11.0122C8.74126 11.0145 8.49045 11.1196 8.30504 11.305C8.11963 11.4904 8.01446 11.7413 8.01219 12.0035C8.00991 12.2657 8.1107 12.5183 8.29286 12.7069L10.2929 14.7069C10.4804 14.8943 10.7347 14.9996 10.9999 14.9996C11.265 14.9996 11.5193 14.8943 11.7069 14.7069L15.7069 10.7069V10.7069Z" fill="currentColor" />
                                    </svg>
                                    { __( 'Read more:', '@@text_domain' ) }
                                    { ' ' }
                                    <a href="https://lazyblocks.com/documentation/blocks-code/theme-template/?utm_source=plugin&utm_medium=constructor&utm_campaign=how_to_use_theme_template&utm_content=@@plugin_version" target="_blank" rel="noopener noreferrer">
                                        { __( 'How to use theme template', '@@text_domain' ) }
                                    </a>
                                </p>
                            </Notice>
                        </PanelBody>
                    ) : '' }

                    <PanelBody>
                        <BaseControl
                            label={ __( 'Show block preview in editor', '@@text_domain' ) }
                        >
                            <SelectControl
                                options={ [
                                    {
                                        label: __( 'Always', '@@text_domain' ),
                                        value: 'always',
                                    }, {
                                        label: __( 'Within `selected` block only', '@@text_domain' ),
                                        value: 'selected',
                                    }, {
                                        label: __( 'Within `unselected` block only', '@@text_domain' ),
                                        value: 'unselected',
                                    }, {
                                        label: __( 'Never', '@@text_domain' ),
                                        value: 'never',
                                    },
                                ] }
                                value={ data.code_show_preview }
                                onChange={ ( value ) => updateData( { code_show_preview: value } ) }
                            />
                        </BaseControl>
                    </PanelBody>
                </div>
            </Fragment>
        );
    }
}

export default withSelect( ( $select ) => {
    const {
        getCurrentTheme,
    } = $select( 'core' );

    return {
        currentTheme: getCurrentTheme(),
    };
} )( CustomCodeSettings );
