import React from 'react';

export default class JournalPhoto extends React.Component {
  constructor(props) {
    super()

    if(props.photo.isLoaded == false) {
      props.photo.load(() => this.setState({loaded: true}));
    }
  }

  render() {
    return (
      <img className="do-entry-photo" src={this.props.photo.dataURL} />
    );
  }
}

