import React, { Fragment } from "react";

type Props = {
  src?: string;
  alt?: string;
  style?: any;
  loadingElement?: React.ReactNode;
};

interface State {
  loaded: boolean;
}

export default class Image extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }

  onLoaded() {
    if (this.props.src) {
      this.setState({ loaded: true });
    }
  }

  render() {
    const { loaded } = this.state;
    const imageStyle = {
      ...(this.props.style ?? {}),
      ...(!loaded ? { display: "none" } : {}),
    };
    return (
      <div className="imageHolder">
        {!loaded && this.props.loadingElement}
        <img
          src={this.props.src}
          alt={this.props.alt}
          style={imageStyle}
          onLoad={() => this.onLoaded()}
        />
      </div>
    );
  }
}
