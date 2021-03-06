import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SideNav from '../component/Sidenav';
import SearchBar from '../component/SearchBar';
import ConceptTable from '../component/ConceptTable';
import Header from './Header';
import {
  fetchBulkConcepts,
  addToFilterList,
  previewConcept,
  addConcept,
  fetchFilteredConcepts,
  setCurrentPage,
} from '../../../redux/actions/concepts/addBulkConcepts';
import { conceptsProps } from '../../dictionaryConcepts/proptypes';

export class BulkConceptsPage extends Component {
  static propTypes = {
    setCurrentPage: PropTypes.func.isRequired,
    currentPage: PropTypes.number.isRequired,
    fetchFilteredConcepts: PropTypes.func.isRequired,
    fetchBulkConcepts: PropTypes.func.isRequired,
    concepts: PropTypes.arrayOf(PropTypes.shape(conceptsProps)).isRequired,
    loading: PropTypes.bool.isRequired,
    preview: PropTypes.shape({
      url: PropTypes.string,
      display_name: PropTypes.string,
    }),
    addConcept: PropTypes.func.isRequired,
    datatypes: PropTypes.array.isRequired,
    previewConcept: PropTypes.func.isRequired,
    classes: PropTypes.array.isRequired,
    addToFilterList: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        type: PropTypes.string,
        typeName: PropTypes.string,
        collectionName: PropTypes.string,
      }).isRequired,
    }).isRequired,
  };

  static defaultProps = {
    preview: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      datatypeInput: '',
      classInput: '',
      searchInput: '',
      conceptLimit: 10,
      searchingOn: false,
    };
  }

  componentDidMount() {
    this.getBulkConcepts();
  }

  componentDidUpdate(prevProps) {
    const { searchingOn } = this.state;
    const { currentPage } = this.props;
    if (currentPage !== prevProps.currentPage) {
      if (searchingOn) {
        return this.searchOption();
      }
      return this.getBulkConcepts();
    }
    return null;
  }

  handleFilter = (event) => {
    const {
      target: { name },
    } = event;
    const targetName = name.split(',');
    const query = `q=${this.state.searchInput}`;
    if ((targetName[1]).trim() === 'datatype') {
      this.props.addToFilterList(targetName[0], 'datatype', query);
    } else {
      this.props.addToFilterList(targetName[0], 'classes', query);
    }
  };

  getBulkConcepts = () => {
    const { currentPage, fetchBulkConcepts: bulkConceptsFetched } = this.props;
    bulkConceptsFetched(currentPage);
  }

  handleChange = (event) => {
    const {
      target: { value },
    } = event;
    this.setState(() => ({ searchInput: value }));
  };

  searchOption = () => {
    const { searchInput } = this.state;
    const query = `q=${searchInput.trim()}`;
    const { currentPage, fetchFilteredConcepts: fetchedFilteredConcepts } = this.props;
    fetchedFilteredConcepts('CIEL', query, currentPage);
  }

  handleSearch = (event) => {
    event.preventDefault();
    const { setCurrentPage: settingCurrentPage } = this.props;
    settingCurrentPage(1);
    this.setState({ searchingOn: true });
    this.searchOption();
  };

  handleNextPage = (e) => {
    e.preventDefault();
    const { id } = e.target;
    const { searchingOn } = this.state;
    const { setCurrentPage: settingCurrentPage } = this.props;
    settingCurrentPage(Number(id));
    if (searchingOn) {
      return this.searchOption();
    }
    return this.getBulkConcepts();
  };

  render() {
    const {
      concepts,
      loading,
      datatypes,
      preview,
      classes,
      currentPage,
      match: { params },
      previewConcept: previewedConcept,
      addConcept: addedConcept,
    } = this.props;
    const {
      datatypeInput, classInput, searchInput, conceptLimit,
    } = this.state;
    return (
      <div className="container-fluid bulk-concepts custom-max-width">
        <section>
          <Header locationPath={this.props.match.params} />
          <div className="col-12 pt-1">
            <h4>Add CIEL concepts</h4>
          </div>
        </section>
        <section className="row mt-3">
          <SideNav
            datatypes={datatypes}
            classes={classes}
            dataTypeValue={datatypeInput}
            classValue={classInput}
            handleChange={this.handleFilter}
          />
          <div className="col-10 col-md-9 bulk-concept-wrapper custom-full-width">
            <SearchBar
              handleSearch={this.handleSearch}
              handleChange={this.handleChange}
              searchInput={searchInput}
            />
            <ConceptTable
              concepts={concepts}
              loading={loading}
              location={params}
              preview={preview}
              previewConcept={previewedConcept}
              addConcept={addedConcept}
              handleNextPage={this.handleNextPage}
              conceptLimit={conceptLimit}
              currentPage={currentPage}
            />
          </div>
        </section>
      </div>
    );
  }
}

export const mapStateToProps = ({ bulkConcepts, concepts }) => ({
  loading: concepts.loading,
  concepts: bulkConcepts.bulkConcepts,
  ...bulkConcepts,
});

export default connect(
  mapStateToProps,
  {
    fetchBulkConcepts,
    addToFilterList,
    previewConcept,
    addConcept,
    fetchFilteredConcepts,
    setCurrentPage,
  },
)(BulkConceptsPage);
